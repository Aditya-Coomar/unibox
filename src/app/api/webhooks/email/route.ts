import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, CommunicationChannel } from "@prisma/client";
import {
  processEmailWebhook,
  validateEmailWebhook,
} from "@/lib/integrations/email";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Get webhook signature for validation (if your email server provides it)
    const signature = request.headers.get("x-email-signature") || "";

    // Parse JSON payload
    const data = await request.json();

    // Validate webhook signature (disabled for development)
    // const integration = await prisma.integration.findFirst({
    //   where: { type: "EMAIL_SERVER", isActive: true }
    // });
    // const secret = (integration?.config as any)?.webhookSecret;
    // if (secret && !validateEmailWebhook(signature, JSON.stringify(data), secret)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

    // Process the webhook data
    const webhookData = processEmailWebhook(data);

    // Find or create contact by email
    let contact = await prisma.contact.findFirst({
      where: { email: webhookData.from },
    });

    if (!contact) {
      // Create new contact
      const emailParts = webhookData.from.split("@");
      const name = emailParts[0].replace(/[._]/g, " ");

      contact = await prisma.contact.create({
        data: {
          email: webhookData.from,
          firstName: name.charAt(0).toUpperCase() + name.slice(1),
        },
      });
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        contactId: contact.id,
        channel: CommunicationChannel.EMAIL,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          contactId: contact.id,
          channel: CommunicationChannel.EMAIL,
          lastMessageAt: webhookData.timestamp,
          unreadCount: 1,
        },
      });
    } else {
      // Update conversation
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: webhookData.timestamp,
          unreadCount: { increment: 1 },
        },
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: webhookData.content,
        channel: CommunicationChannel.EMAIL,
        direction: "INBOUND",
        externalId: webhookData.externalId,
        status: "DELIVERED",
        createdAt: webhookData.timestamp,
        metadata: {
          subject: webhookData.subject,
          from: webhookData.from,
          to: webhookData.to,
        },
      },
    });

    // Handle attachments if present
    if (webhookData.attachments.length > 0) {
      await prisma.messageAttachment.createMany({
        data: webhookData.attachments.map((attachment) => ({
          messageId: message.id,
          fileName: attachment.filename,
          fileUrl: attachment.url,
          fileType: attachment.contentType,
          fileSize: attachment.size,
        })),
      });
    }

    // Update daily metrics
    const today = new Date(webhookData.timestamp);
    today.setHours(0, 0, 0, 0);

    await prisma.dailyMetrics.upsert({
      where: {
        date_channel: {
          date: today,
          channel: CommunicationChannel.EMAIL,
        },
      },
      update: {
        messagesReceived: { increment: 1 },
      },
      create: {
        date: today,
        channel: CommunicationChannel.EMAIL,
        messagesReceived: 1,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
