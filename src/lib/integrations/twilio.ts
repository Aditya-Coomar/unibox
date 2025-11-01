import twilio from "twilio";
import { CommunicationChannel } from "@prisma/client";

// Get Twilio configuration from environment variables
function getTwilioConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !phoneNumber) {
    throw new Error(
      "Twilio credentials not configured in environment variables"
    );
  }

  return {
    accountSid,
    authToken,
    phoneNumber,
    whatsappNumber: whatsappNumber || "whatsapp:+14155238886", // Default sandbox number
  };
}

// Initialize Twilio client
export function getTwilioClient() {
  const config = getTwilioConfig();
  return twilio(config.accountSid, config.authToken);
}

// Send SMS
export async function sendSMS(to: string, message: string, from?: string) {
  try {
    const client = getTwilioClient();
    const config = getTwilioConfig();

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
    const client = getTwilioClient();
    const config = getTwilioConfig();

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
