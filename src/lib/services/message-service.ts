import {
  PrismaClient,
  CommunicationChannel,
  MessageDirection,
} from "@prisma/client";
import { sendSMS, sendWhatsApp } from "@/lib/integrations/twilio";
import { sendEmail } from "@/lib/integrations/email";

const prisma = new PrismaClient();

export interface SendMessageRequest {
  contactId: string;
  channel: CommunicationChannel;
  content: string;
  senderId: string;
  subject?: string; // For emails
  scheduledFor?: Date;
}

export async function sendMessage(request: SendMessageRequest) {
  try {
    // Get contact information
    const contact = await prisma.contact.findUnique({
      where: { id: request.contactId },
    });

    if (!contact) {
      throw new Error("Contact not found");
    }

    // Determine recipient based on channel
    let recipient: string;
    let result: { success: boolean; externalId?: string; error?: string };

    switch (request.channel) {
      case CommunicationChannel.SMS:
        if (!contact.phone) {
          throw new Error("Contact has no phone number for SMS");
        }
        recipient = contact.phone;
        result = await sendSMS(recipient, request.content);
        break;

      case CommunicationChannel.WHATSAPP:
        if (!contact.whatsappNumber) {
          throw new Error("Contact has no WhatsApp number");
        }
        recipient = contact.whatsappNumber;
        result = await sendWhatsApp(recipient, request.content);
        break;

      case CommunicationChannel.EMAIL:
        if (!contact.email) {
          throw new Error("Contact has no email address");
        }
        recipient = contact.email;
        result = await sendEmail(
          recipient,
          request.subject || "Message from UniBox",
          request.content
        );
        break;

      default:
        throw new Error(`Unsupported channel: ${request.channel}`);
    }

    if (!result.success) {
      throw new Error(result.error || "Failed to send message");
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        contactId: request.contactId,
        channel: request.channel,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          contactId: request.contactId,
          channel: request.channel,
          lastMessageAt: new Date(),
        },
      });
    } else {
      // Update conversation
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date() },
      });
    }

    // Create message record
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: request.senderId,
        content: request.content,
        channel: request.channel,
        direction: MessageDirection.OUTBOUND,
        status: "SENT",
        externalId: result.externalId,
        scheduledFor: request.scheduledFor,
        metadata: request.subject ? { subject: request.subject } : undefined,
      },
    });

    // Update daily metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.dailyMetrics.upsert({
      where: {
        date_channel: {
          date: today,
          channel: request.channel,
        },
      },
      update: {
        messagesSent: { increment: 1 },
      },
      create: {
        date: today,
        channel: request.channel,
        messagesSent: 1,
      },
    });

    return {
      success: true,
      message,
      externalId: result.externalId,
    };
  } catch (error) {
    console.error("Failed to send message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get conversations with latest messages
export async function getConversations(
  limit: number = 50,
  offset: number = 0,
  status?: string
) {
  return await prisma.conversation.findMany({
    take: limit,
    skip: offset,
    where: status ? { status: status as any } : undefined,
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          whatsappNumber: true,
          tags: true,
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          direction: true,
          status: true,
          sender: {
            select: { id: true, name: true },
          },
        },
      },
      _count: {
        select: { messages: true },
      },
    },
    orderBy: { lastMessageAt: "desc" },
  });
}

// Get messages for a specific conversation
export async function getMessages(
  conversationId: string,
  limit: number = 50,
  offset: number = 0
) {
  return await prisma.message.findMany({
    where: { conversationId },
    take: limit,
    skip: offset,
    include: {
      sender: {
        select: { id: true, name: true, avatar: true },
      },
      attachments: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

// Mark conversation as read
export async function markConversationAsRead(conversationId: string) {
  return await prisma.conversation.update({
    where: { id: conversationId },
    data: { unreadCount: 0 },
  });
}

// Search conversations
export async function searchConversations(query: string, limit: number = 20) {
  return await prisma.conversation.findMany({
    where: {
      OR: [
        {
          contact: {
            OR: [
              { firstName: { contains: query, mode: "insensitive" } },
              { lastName: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
              { phone: { contains: query } },
            ],
          },
        },
        {
          messages: {
            some: {
              content: { contains: query, mode: "insensitive" },
            },
          },
        },
      ],
    },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          whatsappNumber: true,
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
    take: limit,
    orderBy: { lastMessageAt: "desc" },
  });
}
