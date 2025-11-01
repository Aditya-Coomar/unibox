import { NextRequest, NextResponse } from "next/server";
import { CommunicationChannel } from "@prisma/client";
import {
  processTwilioWebhook,
  validateTwilioSignature,
} from "@/lib/integrations/twilio";
import { processInboundMessage } from "@/lib/services/message-service";

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

    // Prepare attachments if media is present
    const attachments = webhookData.hasMedia
      ? [
          {
            filename: `media_${Date.now()}`,
            url: webhookData.mediaUrl || "",
            contentType: webhookData.mediaType || "application/octet-stream",
            size: 0, // Size not available from Twilio webhook
          },
        ]
      : [];

    // Process the inbound message using our service
    const result = await processInboundMessage({
      from: webhookData.from.replace("whatsapp:", ""),
      to: webhookData.to,
      content: webhookData.content,
      channel: webhookData.channel as CommunicationChannel,
      externalId: webhookData.externalId,
      timestamp: new Date(),
      attachments: attachments,
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
    console.error("Twilio webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
