import { NextRequest, NextResponse } from "next/server";
import { syncInboxEmails } from "@/lib/services/message-service";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { folder = "INBOX" } = body;

    const result = await syncInboxEmails(folder);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to sync emails" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        processedCount: result.processedCount,
        totalEmails: result.totalEmails,
        messages: result.messages,
      },
    });
  } catch (error) {
    console.error("Failed to sync emails:", error);
    return NextResponse.json(
      { error: "Failed to sync emails" },
      { status: 500 }
    );
  }
}
