import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { sendMessage } from "@/lib/services/message-service";

const SendMessageSchema = z.object({
  contactId: z.string(),
  content: z.string().min(1),
  channel: z.enum(["SMS", "WHATSAPP", "EMAIL", "VOICE_CALL"]),
  subject: z.string().optional(), // For email subject
  scheduledFor: z.string().datetime().optional(),
  attachments: z
    .array(
      z.object({
        fileName: z.string(),
        fileUrl: z.string().url(),
        fileType: z.string(),
        fileSize: z.number(),
      })
    )
    .optional(),
});

// POST /api/messages/send - Send a message to a contact
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if request is FormData (for file attachments) or JSON
    const contentType = request.headers.get("content-type") || "";
    let validatedData: any;
    let fileAttachments: File[] = [];

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData request with file attachments
      const formData = await request.formData();

      const bodyData = {
        contactId: formData.get("contactId") as string,
        content: formData.get("content") as string,
        channel: formData.get("channel") as string,
        subject: formData.get("subject") as string,
        scheduledFor: formData.get("scheduledFor") as string,
      };

      // Extract file attachments
      const files = formData.getAll("attachments") as File[];
      fileAttachments = files.filter((file) => file.size > 0);

      validatedData = SendMessageSchema.parse({
        ...bodyData,
        scheduledFor: bodyData.scheduledFor || undefined,
        subject: bodyData.subject || undefined,
      });
    } else {
      // Handle JSON request (backward compatibility)
      const body = await request.json();
      validatedData = SendMessageSchema.parse(body);
    }

    // Get contact details
    const contact = await prisma.contact.findUnique({
      where: { id: validatedData.contactId },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        contactId: validatedData.contactId,
        channel: validatedData.channel,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          contactId: validatedData.contactId,
          channel: validatedData.channel,
        },
      });
    }

    // Use the message service to send the message
    const result = await sendMessage({
      contactId: validatedData.contactId,
      channel: validatedData.channel,
      content: validatedData.content,
      senderId: session.user.id,
      subject: validatedData.subject,
      scheduledFor: validatedData.scheduledFor
        ? new Date(validatedData.scheduledFor)
        : undefined,
      attachments: fileAttachments.length > 0 ? fileAttachments : undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      message: result.message,
      status: "sent",
      externalId: result.externalId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error in send message endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
