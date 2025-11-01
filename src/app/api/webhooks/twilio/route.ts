import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, CommunicationChannel } from "@prisma/client";
import {
  processTwilioWebhook,
  validateTwilioSignature,
} from "@/lib/integrations/twilio";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Get webhook signature for validation
    const signature = request.headers.get("x-twilio-signature") || "";
    const url = request.url;

    // Parse form data
    const formData = await request.formData();
    const params: Record<string, string> = {};

    for (const [key, value] of formData.entries()) {
      params[key] = value.toString();
    }

    // Validate webhook signature (disabled for development)
    // if (!validateTwilioSignature(signature, url, params)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

    // Process the webhook data
    const webhookData = processTwilioWebhook(params as any);

    // Find or create contact
    const phoneNumber = webhookData.from.replace("whatsapp:", "");
    let contact = await prisma.contact.findFirst({
      where: {
        OR: [{ phone: phoneNumber }, { whatsappNumber: phoneNumber }],
      },
    });

    if (!contact) {
      // Create new contact
      contact = await prisma.contact.create({
        data: {
          phone: webhookData.channel === "SMS" ? phoneNumber : undefined,
          whatsappNumber:
            webhookData.channel === "WHATSAPP" ? phoneNumber : undefined,
          firstName: `Contact ${phoneNumber.slice(-4)}`, // Temporary name
        },
      });
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        contactId: contact.id,
        channel: webhookData.channel,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          contactId: contact.id,
          channel: webhookData.channel,
          lastMessageAt: new Date(),
          unreadCount: 1,
        },
      });
    } else {
      // Update conversation
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: new Date(),
          unreadCount: { increment: 1 },
        },
      });
    }

    // Create message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: webhookData.content,
        channel: webhookData.channel,
        direction: "INBOUND",
        externalId: webhookData.externalId,
        status: "DELIVERED",
        metadata: webhookData.hasMedia
          ? {
              mediaUrl: webhookData.mediaUrl,
              mediaType: webhookData.mediaType,
            }
          : undefined,
      },
    });

    // Update daily metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.dailyMetrics.upsert({
      where: {
        date_channel: {
          date: today,
          channel: webhookData.channel,
        },
      },
      update: {
        messagesReceived: { increment: 1 },
      },
      create: {
        date: today,
        channel: webhookData.channel,
        messagesReceived: 1,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Twilio webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
