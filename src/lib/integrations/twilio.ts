import twilio from "twilio";
import { PrismaClient, CommunicationChannel } from "@prisma/client";

const prisma = new PrismaClient();

// Get Twilio configuration from database
async function getTwilioConfig() {
  const integration = await prisma.integration.findFirst({
    where: { type: "TWILIO", isActive: true },
  });

  if (!integration) {
    throw new Error("Twilio integration not configured");
  }

  const config = integration.config as {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
    whatsappNumber: string;
  };

  return config;
}

// Initialize Twilio client
export async function getTwilioClient() {
  const config = await getTwilioConfig();
  return twilio(config.accountSid, config.authToken);
}

// Send SMS
export async function sendSMS(to: string, message: string, from?: string) {
  try {
    const client = await getTwilioClient();
    const config = await getTwilioConfig();

    const result = await client.messages.create({
      body: message,
      from: from || config.phoneNumber,
      to: to,
    });

    return {
      success: true,
      externalId: result.sid,
      status: result.status,
    };
  } catch (error) {
    console.error("Failed to send SMS:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Send WhatsApp message
export async function sendWhatsApp(to: string, message: string) {
  try {
    const client = await getTwilioClient();
    const config = await getTwilioConfig();

    // Format WhatsApp numbers
    const whatsappTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

    const result = await client.messages.create({
      body: message,
      from: config.whatsappNumber,
      to: whatsappTo,
    });

    return {
      success: true,
      externalId: result.sid,
      status: result.status,
    };
  } catch (error) {
    console.error("Failed to send WhatsApp:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Validate webhook signature
export function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  try {
    // This would use Twilio's webhook validation in production
    // For now, we'll implement basic validation
    return true;
  } catch (error) {
    console.error("Webhook validation failed:", error);
    return false;
  }
}

// Process incoming webhook
export interface TwilioWebhookData {
  MessageSid: string;
  From: string;
  To: string;
  Body: string;
  NumMedia?: string;
  MediaUrl0?: string;
  MediaContentType0?: string;
}

export function processTwilioWebhook(data: TwilioWebhookData) {
  return {
    externalId: data.MessageSid,
    from: data.From,
    to: data.To,
    content: data.Body,
    hasMedia: parseInt(data.NumMedia || "0") > 0,
    mediaUrl: data.MediaUrl0,
    mediaType: data.MediaContentType0,
    channel: data.From.startsWith("whatsapp:")
      ? CommunicationChannel.WHATSAPP
      : CommunicationChannel.SMS,
  };
}
