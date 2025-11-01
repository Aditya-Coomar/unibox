import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { sendSMS, sendWhatsApp } from "@/lib/integrations/twilio";
import { sendEmail } from "@/lib/integrations/email";

const SendMessageSchema = z.object({
  contactId: z.string(),
  content: z.string().min(1),
  channel: z.enum(["SMS", "WHATSAPP", "EMAIL", "VOICE_CALL"]),
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

    const body = await request.json();
    const validatedData = SendMessageSchema.parse(body);

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

    // If message is scheduled, save it as scheduled
    if (validatedData.scheduledFor) {
      const message = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: session.user.id,
          content: validatedData.content,
          channel: validatedData.channel,
          direction: "OUTBOUND",
          status: "SCHEDULED",
          scheduledFor: new Date(validatedData.scheduledFor),
        },
        include: {
          conversation: {
            include: {
              contact: true,
            },
          },
          sender: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Create attachments if provided
      if (validatedData.attachments) {
        await prisma.messageAttachment.createMany({
          data: validatedData.attachments.map((att) => ({
            messageId: message.id,
            ...att,
          })),
        });
      }

      return NextResponse.json({
        message,
        status: "scheduled",
      });
    }

    let externalId: string | null = null;
    let status: "SENT" | "FAILED" = "SENT";
    let errorMessage: string | null = null;

    // Send message immediately based on channel
    try {
      switch (validatedData.channel) {
        case "SMS":
          if (!contact.phone) {
            return NextResponse.json(
              { error: "Contact has no phone number for SMS" },
              { status: 400 }
            );
          }
          const smsResult = await sendSMS(contact.phone, validatedData.content);
          if (smsResult.success) {
            externalId = smsResult.externalId || null;
          } else {
            status = "FAILED";
            errorMessage = smsResult.error || "SMS sending failed";
          }
          break;

        case "WHATSAPP":
          const whatsappNumber = contact.whatsappNumber || contact.phone;
          if (!whatsappNumber) {
            return NextResponse.json(
              { error: "Contact has no WhatsApp number" },
              { status: 400 }
            );
          }
          const whatsappResult = await sendWhatsApp(
            whatsappNumber,
            validatedData.content
          );
          if (whatsappResult.success) {
            externalId = whatsappResult.externalId || null;
          } else {
            status = "FAILED";
            errorMessage = whatsappResult.error || "WhatsApp sending failed";
          }
          break;

        case "EMAIL":
          if (!contact.email) {
            return NextResponse.json(
              { error: "Contact has no email address" },
              { status: 400 }
            );
          }
          const emailResult = await sendEmail(
            contact.email,
            "Message from UniBox",
            validatedData.content
          );
          if (emailResult.success) {
            externalId = emailResult.externalId || null;
          } else {
            status = "FAILED";
            errorMessage = emailResult.error || "Email sending failed";
          }
          break;

        default:
          return NextResponse.json(
            { error: "Unsupported channel" },
            { status: 400 }
          );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      status = "FAILED";
      errorMessage = error instanceof Error ? error.message : "Unknown error";
    }

    // Save message to database
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: session.user.id,
        content: validatedData.content,
        channel: validatedData.channel,
        direction: "OUTBOUND",
        status,
        externalId,
        metadata: errorMessage ? { error: errorMessage } : undefined,
      },
      include: {
        conversation: {
          include: {
            contact: true,
          },
        },
        sender: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Create attachments if provided
    if (validatedData.attachments) {
      await prisma.messageAttachment.createMany({
        data: validatedData.attachments.map((att) => ({
          messageId: message.id,
          ...att,
        })),
      });
    }

    // Update conversation last message time
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json({
      message,
      status: status === "SENT" ? "sent" : "failed",
      error: errorMessage,
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
