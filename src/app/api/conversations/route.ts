import { NextRequest, NextResponse } from "next/server";
import {
  getConversations,
  searchConversations,
} from "@/lib/services/message-service";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status") || undefined;
    const query = searchParams.get("query") || undefined;

    let conversations;

    if (query) {
      conversations = await searchConversations(query, limit);
    } else {
      conversations = await getConversations(limit, offset, status);
    }

    return NextResponse.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
