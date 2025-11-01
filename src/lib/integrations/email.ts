import { PrismaClient, CommunicationChannel } from "@prisma/client";

const prisma = new PrismaClient();

// Get Email server configuration from database
async function getEmailConfig() {
  const integration = await prisma.integration.findFirst({
    where: { type: "EMAIL_SERVER", isActive: true },
  });

  if (!integration) {
    throw new Error("Email server integration not configured");
  }

  const config = integration.config as {
    apiEndpoint: string;
    apiKey: string;
    webhookSecret?: string;
  };

  return config;
}

// Send email via your custom server
export async function sendEmail(
  to: string,
  subject: string,
  content: string,
  from?: string
) {
  try {
    const config = await getEmailConfig();

    const response = await fetch(`${config.apiEndpoint}/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        to,
        from,
        subject,
        content,
        contentType: "text/plain", // or "text/html" if needed
      }),
    });

    if (!response.ok) {
      throw new Error(`Email API error: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      success: true,
      externalId: result.messageId || result.id,
      status: result.status || "SENT",
    };
  } catch (error) {
    console.error("Failed to send email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Fetch inbox from your email server
export async function fetchInbox(limit: number = 50, offset: number = 0) {
  try {
    const config = await getEmailConfig();

    const response = await fetch(
      `${config.apiEndpoint}/inbox?limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Email API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to fetch inbox:", error);
    throw error;
  }
}

// Process email webhook data
export interface EmailWebhookData {
  messageId: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  timestamp: string;
  attachments?: Array<{
    filename: string;
    url: string;
    contentType: string;
    size: number;
  }>;
}

export function processEmailWebhook(data: EmailWebhookData) {
  return {
    externalId: data.messageId,
    from: data.from,
    to: data.to,
    subject: data.subject,
    content: data.content,
    channel: CommunicationChannel.EMAIL,
    timestamp: new Date(data.timestamp),
    attachments: data.attachments || [],
  };
}

// Validate email webhook (if your server provides signature verification)
export function validateEmailWebhook(
  signature: string,
  payload: string,
  secret: string
): boolean {
  try {
    // Implement your email server's webhook validation logic here
    // This is a placeholder - replace with your server's specific validation
    return true;
  } catch (error) {
    console.error("Email webhook validation failed:", error);
    return false;
  }
}
