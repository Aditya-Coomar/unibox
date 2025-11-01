import { NextRequest, NextResponse } from "next/server";
import { CommunicationChannel } from "@prisma/client";
import {
  processEmailWebhook,
  validateEmailWebhook,
} from "@/lib/integrations/email";
import { processInboundMessage } from "@/lib/services/message-service";

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

    // Process the inbound message using our service
    const result = await processInboundMessage({
      from: webhookData.from,
      to: webhookData.to,
      content: webhookData.content,
      channel: CommunicationChannel.EMAIL,
      externalId: webhookData.externalId,
      subject: webhookData.subject,
      timestamp: webhookData.timestamp,
      attachments: webhookData.attachments,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to process message" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: result.message,
        conversation: result.conversation,
        contact: result.contact,
      },
    });
  } catch (error) {
    console.error("Email webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
