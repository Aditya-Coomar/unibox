import { CommunicationChannel } from "@prisma/client";

// Get custom email API configuration from environment variables
function getEmailConfig() {
  const apiKey =
    process.env.CUSTOM_EMAIL_API_KEY ||
    "CH.dev.LikSVyMhOYvCTl5PrrDjHWfqUZUdg9XX-soMsFNQwZQ";
  const apiUrl =
    process.env.CUSTOM_EMAIL_API_URL ||
    "https://mailer.adityacoomar.dev/api/send-email";
  const inboundApiUrl =
    process.env.CUSTOM_EMAIL_INBOUND_API_URL ||
    "https://mailer.adityacoomar.dev/api";

  if (!apiKey || !apiUrl) {
    throw new Error(
      "Custom email API key and URL not configured in environment variables"
    );
  }

  return {
    apiKey,
    apiUrl,
    inboundApiUrl,
    senderName: process.env.CUSTOM_EMAIL_SENDER_NAME || "UniBox Email Service",
  };
}

// Send email via custom API
export async function sendEmail(
  to: string,
  subject: string,
  content: string,
  from?: string,
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }>
) {
  try {
    const config = getEmailConfig();

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("x-api-key", config.apiKey);

    // Convert plain text content to HTML if it's not already HTML
    const isHtml = content.includes("<") && content.includes(">");
    const htmlContent = isHtml
      ? content
      : `<p>${content.replace(/\n/g, "<br>")}</p>`;

    const emailData = {
      recipients: [to],
      mailSubject: subject,
      mailBody: htmlContent,
      mailSenderName: from || config.senderName,
    };

    const requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(emailData),
    };

    const response = await fetch(config.apiUrl, requestOptions);
    const result = await response.text();

    if (!response.ok) {
      throw new Error(`Email API error: ${response.status} - ${result}`);
    }

    return {
      success: true,
      externalId: `email_${Date.now()}`, // Generate a simple ID
      status: "SENT",
    };
  } catch (error) {
    console.error("Failed to send email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Fetch emails from inbox using the provided API
export async function fetchInboxEmails(
  folder: string = "INBOX",
  search?: string,
  limit: number = 50
) {
  try {
    const config = getEmailConfig();

    const myHeaders = new Headers();
    myHeaders.append("x-api-key", config.apiKey);

    let url = `${config.inboundApiUrl}/fetch-emails?folder=${folder}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow" as RequestRedirect,
    };

    const response = await fetch(url, requestOptions);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        `Email fetch API error: ${response.status} - ${result.message}`
      );
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("Failed to fetch emails:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Fetch specific email content by UID
export async function fetchEmailContent(uid: number) {
  try {
    const config = getEmailConfig();

    const myHeaders = new Headers();
    myHeaders.append("x-api-key", config.apiKey);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow" as RequestRedirect,
    };

    const response = await fetch(
      `${config.inboundApiUrl}/email/content?uid=${uid}`,
      requestOptions
    );
    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        `Email content API error: ${response.status} - ${result.message}`
      );
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("Failed to fetch email content:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Process email data from the API response
export interface EmailData {
  uid: number;
  messageId: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  date: string;
  flags: string[];
  size: number;
  folder: string;
  attachments: Array<{
    filename: string;
    url: string;
    contentType: string;
    size: number;
  }>;
  bodyText: string;
  bodyHtml: string;
}

export function processEmailData(emailData: EmailData) {
  return {
    externalId: emailData.messageId,
    uid: emailData.uid,
    from: emailData.from,
    to: emailData.to,
    cc: emailData.cc || [],
    bcc: emailData.bcc || [],
    subject: emailData.subject,
    content: emailData.bodyText || emailData.bodyHtml || "No content available",
    channel: CommunicationChannel.EMAIL,
    timestamp: new Date(emailData.date),
    attachments: emailData.attachments || [],
    flags: emailData.flags || [],
    folder: emailData.folder,
    size: emailData.size,
  };
}

// Process email webhook data (for webhook compatibility)
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
