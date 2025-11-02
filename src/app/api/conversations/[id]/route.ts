import { NextRequest, NextResponse } from "next/server";
import {
  getConversationDetails,
  getMessages,
  markConversationAsRead,
  replyToConversation,
} from "@/lib/services/message-service";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const { searchParams } = new URL(request.url);
    const includeMessages = searchParams.get("includeMessages") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (includeMessages) {
      const conversation = await getConversationDetails(conversationId);
      const messages = await getMessages(conversationId, limit, offset);

      return NextResponse.json({
        success: true,
        data: {
          ...conversation,
          messages,
        },
      });
    } else {
      const conversation = await getConversationDetails(conversationId);
      return NextResponse.json({
        success: true,
        data: conversation,
      });
    }
  } catch (error) {
    console.error("Failed to fetch conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const body = await request.json();
    const { action } = body;

    if (action === "markAsRead") {
      const result = await markConversationAsRead(conversationId);
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Failed to update conversation:", error);
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const body = await request.json();
    const { content, subject } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const result = await replyToConversation(
      conversationId,
      content,
      session.user.id,
      subject
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send reply" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Failed to reply to conversation:", error);
    return NextResponse.json(
      { error: "Failed to reply to conversation" },
      { status: 500 }
    );
  }
}
