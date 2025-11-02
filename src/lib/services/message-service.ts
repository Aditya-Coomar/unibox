import {
  PrismaClient,
  CommunicationChannel,
  MessageDirection,
  MessageStatus,
} from "@prisma/client";
import { sendSMS, sendWhatsApp } from "@/lib/integrations/twilio";
import {
  sendEmail,
  fetchInboxEmails,
  fetchEmailContent,
  processEmailData,
} from "@/lib/integrations/email";

const prisma = new PrismaClient();

export interface SendMessageRequest {
  contactId: string;
  channel: CommunicationChannel;
  content: string;
  senderId: string;
  subject?: string; // For emails
  scheduledFor?: Date;
  attachments?: File[]; // For email file attachments
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
          request.content,
          undefined, // from parameter (using default)
          request.attachments // pass file attachments
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

    // Handle outbound attachments if present
    if (request.attachments && request.attachments.length > 0) {
      // For now, we create placeholder attachment records since we don't have the actual file URLs
      // In a production system, you would upload files to a storage service first
      await prisma.messageAttachment.createMany({
        data: request.attachments.map((file, index) => ({
          messageId: message.id,
          fileName: file.name,
          fileUrl: `#attachment-${message.id}-${index}`, // Placeholder URL
          fileType: file.type,
          fileSize: file.size,
        })),
      });
    }

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
        select: { id: true, name: true, image: true },
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

// Process inbound message
export async function processInboundMessage(data: {
  from: string;
  to: string;
  content: string;
  channel: CommunicationChannel;
  externalId?: string;
  subject?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    url: string;
    contentType: string;
    size: number;
  }>;
}) {
  try {
    // Find or create contact based on channel
    let contact;
    let contactField: string;
    let searchValue: string;

    switch (data.channel) {
      case CommunicationChannel.EMAIL:
        contactField = "email";
        searchValue = data.from;
        break;
      case CommunicationChannel.SMS:
      case CommunicationChannel.WHATSAPP:
        contactField = "phone";
        searchValue = data.from;
        break;
      default:
        throw new Error(`Unsupported channel: ${data.channel}`);
    }

    contact = await prisma.contact.findFirst({
      where: { [contactField]: searchValue },
    });

    if (!contact) {
      // Create new contact
      const contactData: any = {
        [contactField]: searchValue,
        isActive: true,
      };

      // Try to extract name from email or phone
      if (data.channel === CommunicationChannel.EMAIL) {
        const emailParts = data.from.split("@");
        const name = emailParts[0].replace(/[._]/g, " ");
        contactData.firstName = name.charAt(0).toUpperCase() + name.slice(1);
      } else {
        contactData.firstName = data.from; // Use phone number as name for now
      }

      contact = await prisma.contact.create({
        data: contactData,
      });
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        contactId: contact.id,
        channel: data.channel,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          contactId: contact.id,
          channel: data.channel,
          lastMessageAt: data.timestamp || new Date(),
          unreadCount: 1,
        },
      });
    } else {
      // Update conversation
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: data.timestamp || new Date(),
          unreadCount: { increment: 1 },
        },
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: data.content,
        channel: data.channel,
        direction: MessageDirection.INBOUND,
        status: MessageStatus.DELIVERED,
        externalId: data.externalId,
        createdAt: data.timestamp || new Date(),
        metadata: {
          subject: data.subject,
          from: data.from,
          to: data.to,
          // Include any additional metadata passed in
          ...(typeof data.metadata === "object" && data.metadata
            ? data.metadata
            : {}),
        },
      },
    });

    // Handle attachments if present
    if (data.attachments && data.attachments.length > 0) {
      await prisma.messageAttachment.createMany({
        data: data.attachments.map((attachment) => ({
          messageId: message.id,
          fileName: attachment.filename,
          fileUrl: attachment.url,
          fileType: attachment.contentType,
          fileSize: attachment.size,
        })),
      });
    }

    // Update daily metrics
    const today = new Date(data.timestamp || new Date());
    today.setHours(0, 0, 0, 0);

    await prisma.dailyMetrics.upsert({
      where: {
        date_channel: {
          date: today,
          channel: data.channel,
        },
      },
      update: {
        messagesReceived: { increment: 1 },
      },
      create: {
        date: today,
        channel: data.channel,
        messagesReceived: 1,
      },
    });

    return {
      success: true,
      message,
      conversation,
      contact,
    };
  } catch (error) {
    console.error("Failed to process inbound message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Sync inbox emails (poll for new emails)
export async function syncInboxEmails(folder: string = "INBOX") {
  try {
    const result = await fetchInboxEmails(folder);

    if (!result.success) {
      throw new Error(result.error);
    }

    const emails = result.data.emails;
    const processedEmails = [];

    for (const email of emails) {
      // Check if we already have this email
      const existingMessage = await prisma.message.findFirst({
        where: {
          externalId: email.messageId,
          channel: CommunicationChannel.EMAIL,
        },
      });

      if (existingMessage) {
        continue; // Skip already processed emails
      }

      // Fetch full email content if bodyText is not available
      let emailContent = email.bodyText;
      if (
        emailContent ===
        "Body content available - use specific email fetch endpoint"
      ) {
        const contentResult = await fetchEmailContent(email.uid);
        if (contentResult.success) {
          emailContent =
            contentResult.data.bodyText ||
            contentResult.data.bodyHtml ||
            "No content available";
        }
      }

      // Process the email as an inbound message
      const processedEmail = processEmailData({
        ...email,
        bodyText: emailContent,
        to: email.to || [],
        cc: email.cc || [],
        bcc: email.bcc || [],
        attachments: email.attachments || [],
      });

      const messageResult = await processInboundMessage({
        from: processedEmail.from,
        to: Array.isArray(processedEmail.to)
          ? processedEmail.to[0]
          : processedEmail.to,
        content: processedEmail.content,
        channel: processedEmail.channel,
        externalId: processedEmail.externalId,
        subject: processedEmail.subject,
        timestamp: processedEmail.timestamp,
        attachments: processedEmail.attachments,
      });

      if (messageResult.success) {
        processedEmails.push(messageResult.message);
      }
    }

    return {
      success: true,
      processedCount: processedEmails.length,
      totalEmails: emails.length,
      messages: processedEmails,
    };
  } catch (error) {
    console.error("Failed to sync inbox emails:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get conversation with full details
export async function getConversationDetails(conversationId: string) {
  return await prisma.conversation.findUnique({
    where: { id: conversationId },
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
          customFields: true,
        },
      },
      messages: {
        include: {
          sender: {
            select: { id: true, name: true, image: true },
          },
          attachments: true,
        },
        orderBy: { createdAt: "asc" },
      },
      _count: {
        select: { messages: true },
      },
    },
  });
}

// Reply to a conversation
export async function replyToConversation(
  conversationId: string,
  content: string,
  senderId: string,
  subject?: string
) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { contact: true },
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Send the message using existing sendMessage function
    const result = await sendMessage({
      contactId: conversation.contactId,
      channel: conversation.channel,
      content,
      senderId,
      subject,
    });

    return result;
  } catch (error) {
    console.error("Failed to reply to conversation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
