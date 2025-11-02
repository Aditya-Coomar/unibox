import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSMS, sendWhatsApp } from "@/lib/integrations/twilio";
import { sendEmail } from "@/lib/integrations/email";
import { CommunicationChannel, MessageStatus } from "@prisma/client";

// POST /api/scheduled-messages/process - Process scheduled messages
export async function POST(request: NextRequest) {
  try {
    // Simple API key authentication for cron jobs
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CRON_SECRET || "your-cron-secret";

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Find messages that are scheduled to be sent now or in the past
    const scheduledMessages = await prisma.message.findMany({
      where: {
        status: MessageStatus.SCHEDULED,
        scheduledFor: {
          lte: now,
        },
      },
      include: {
        conversation: {
          include: {
            contact: true,
          },
        },
        attachments: true,
        sender: true,
      },
      take: 50, // Process up to 50 messages at a time
    });

    const results = [];

    for (const message of scheduledMessages) {
      try {
        const contact = message.conversation.contact;
        let result: { success: boolean; externalId?: string; error?: string };

        // Determine recipient and send based on channel
        switch (message.channel) {
          case CommunicationChannel.SMS:
            if (!contact.phone) {
              throw new Error("Contact has no phone number for SMS");
            }
            result = await sendSMS(contact.phone, message.content);
            break;

          case CommunicationChannel.WHATSAPP:
            if (!contact.whatsappNumber) {
              throw new Error("Contact has no WhatsApp number");
            }
            result = await sendWhatsApp(
              contact.whatsappNumber,
              message.content
            );
            break;

          case CommunicationChannel.EMAIL:
            if (!contact.email) {
              throw new Error("Contact has no email address");
            }

            // Get subject from metadata or use default
            const subject =
              (message.metadata as any)?.subject ||
              "Scheduled message from UniBox";

            // Convert attachments for email sending (simplified for demo)
            const emailAttachments =
              message.attachments.length > 0
                ? undefined // For now, skip attachments in scheduled emails
                : undefined;

            result = await sendEmail(
              contact.email,
              subject,
              message.content,
              undefined,
              emailAttachments
            );
            break;

          default:
            throw new Error(`Unsupported channel: ${message.channel}`);
        }

        if (result.success) {
          // Update message status to SENT
          await prisma.message.update({
            where: { id: message.id },
            data: {
              status: MessageStatus.SENT,
              externalId: result.externalId,
              deliveredAt: now,
            },
          });

          // Update conversation last message time
          await prisma.conversation.update({
            where: { id: message.conversationId },
            data: { lastMessageAt: now },
          });

          results.push({
            messageId: message.id,
            status: "sent",
            channel: message.channel,
            recipient: contact.email || contact.phone || contact.whatsappNumber,
          });
        } else {
          // Update message status to FAILED
          await prisma.message.update({
            where: { id: message.id },
            data: {
              status: MessageStatus.FAILED,
              metadata: {
                ...((message.metadata as Record<string, any>) || {}),
                error: result.error,
                failedAt: now.toISOString(),
              },
            },
          });

          results.push({
            messageId: message.id,
            status: "failed",
            error: result.error,
            channel: message.channel,
            recipient: contact.email || contact.phone || contact.whatsappNumber,
          });
        }
      } catch (error) {
        // Handle individual message errors
        await prisma.message.update({
          where: { id: message.id },
          data: {
            status: MessageStatus.FAILED,
            metadata: {
              ...((message.metadata as Record<string, any>) || {}),
              error: error instanceof Error ? error.message : "Unknown error",
              failedAt: now.toISOString(),
            },
          },
        });

        results.push({
          messageId: message.id,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
          channel: message.channel,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: scheduledMessages.length,
      results,
      processedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Error processing scheduled messages:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET /api/scheduled-messages/process - Get status of scheduled message processor
export async function GET(request: NextRequest) {
  try {
    const now = new Date();

    // Get count of pending scheduled messages
    const pendingCount = await prisma.message.count({
      where: {
        status: MessageStatus.SCHEDULED,
        scheduledFor: {
          lte: now,
        },
      },
    });

    // Get count of future scheduled messages
    const futureCount = await prisma.message.count({
      where: {
        status: MessageStatus.SCHEDULED,
        scheduledFor: {
          gt: now,
        },
      },
    });

    // Get recent processing history (last 10 processed messages)
    const recentProcessed = await prisma.message.findMany({
      where: {
        OR: [{ status: MessageStatus.SENT }, { status: MessageStatus.FAILED }],
        scheduledFor: {
          not: null,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        status: true,
        channel: true,
        scheduledFor: true,
        deliveredAt: true,
        createdAt: true,
        conversation: {
          select: {
            contact: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      status: "healthy",
      pendingMessages: pendingCount,
      futureMessages: futureCount,
      recentProcessed,
      lastCheck: now.toISOString(),
    });
  } catch (error) {
    console.error("Error getting processor status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
