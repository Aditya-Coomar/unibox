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

// Send email via custom API - Enhanced with file attachment support
export async function sendEmail(
  to: string,
  subject: string,
  content: string,
  from?: string,
  attachments?:
    | File[]
    | Array<{
        fileName: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
      }>
) {
  try {
    const config = getEmailConfig();

    // Convert plain text content to HTML if it's not already HTML
    const isHtml = content.includes("<") && content.includes(">");
    const htmlContent = isHtml
      ? content
      : `<p>${content.replace(/\n/g, "<br>")}</p>`;

    // Check if we have File objects (new attachment format) vs URL attachments (old format)
    const hasFileAttachments =
      attachments && attachments.length > 0 && attachments[0] instanceof File;

    if (hasFileAttachments) {
      // NEW: Use FormData for file attachments
      const formData = new FormData();
      // Clean and validate email address thoroughly
      const cleanEmail = to
        .trim()
        .toLowerCase()
        .replace(/^\s+|\s+$/g, "") // Remove leading/trailing whitespace
        .replace(/[--]/g, "") // Remove control characters only
        .replace(/\s+/g, ""); // Remove any internal spaces

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        throw new Error(`Invalid email format: ${cleanEmail}`);
      }
      formData.append("recipients", cleanEmail);
      formData.append("mailSubject", subject);
      formData.append("mailBody", htmlContent);
      formData.append("mailSenderName", from || config.senderName);

      // Add file attachments (limit to 1 file)
      const fileAttachments = attachments as File[];
      if (fileAttachments.length > 0) {
        formData.append("attachments", fileAttachments[0]); // Only send the first file
      }

      const headers = new Headers();
      headers.append("x-api-key", config.apiKey);
      // Don't set Content-Type for FormData - browser will set it with boundary

      const requestOptions = {
        method: "POST",
        headers: headers,
        body: formData,
      };

      const response = await fetch(config.apiUrl, requestOptions);
      const result = await response.text();

      if (!response.ok) {
        // Parse the error response to provide more helpful error messages
        let errorMessage = `Email API error: ${response.status}`;
        try {
          const errorData = JSON.parse(result);
          if (
            errorData.message &&
            errorData.message.includes("Invalid domain")
          ) {
            errorMessage = `Email domain validation failed. The email service may not support sending to ${
              cleanEmail.split("@")[1]
            } domains, or the service may be in sandbox mode. Please check the email API configuration or use a different email address.`;
          } else {
            errorMessage = `Email API error: ${errorData.message || result}`;
          }
        } catch {
          errorMessage = `Email API error: ${response.status} - ${result}`;
        }

        throw new Error(errorMessage);
      }

      return {
        success: true,
        externalId: `email_${Date.now()}`,
        status: "SENT",
      };
    } else {
      // EXISTING: Use JSON for backward compatibility
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("x-api-key", config.apiKey);

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
        externalId: `email_${Date.now()}`,
        status: "SENT",
      };
    }
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
