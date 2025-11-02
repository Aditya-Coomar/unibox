import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Store active SSE connections
const connections = new Map<string, WritableStreamDefaultWriter>();

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create a ReadableStream for Server-Sent Events
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();

        // Send initial connection message
        const data = `data: ${JSON.stringify({
          type: "connected",
          timestamp: new Date().toISOString(),
        })}\n\n`;
        controller.enqueue(encoder.encode(data));

        // Store the connection for this user
        const userId = session.user.id;
        const writer = controller;

        // Keep connection alive with heartbeat
        const heartbeat = setInterval(() => {
          try {
            const heartbeatData = `data: ${JSON.stringify({
              type: "heartbeat",
              timestamp: new Date().toISOString(),
            })}\n\n`;
            controller.enqueue(encoder.encode(heartbeatData));
          } catch (error) {
            clearInterval(heartbeat);
            connections.delete(userId);
          }
        }, 30000); // Send heartbeat every 30 seconds

        // Store connection reference
        connections.set(userId, {
          enqueue: (data: string) => {
            try {
              controller.enqueue(encoder.encode(data));
            } catch (error) {
              console.error("Failed to send SSE data:", error);
              connections.delete(userId);
              clearInterval(heartbeat);
            }
          },
        } as any);

        // Clean up on close
        request.signal.addEventListener("abort", () => {
          clearInterval(heartbeat);
          connections.delete(userId);
          try {
            controller.close();
          } catch (error) {
            // Connection already closed
          }
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      },
    });
  } catch (error) {
    console.error("SSE connection error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Function to broadcast updates to all connected clients
export function broadcastUpdate(data: any) {
  const message = `data: ${JSON.stringify({
    type: "conversation_update",
    data,
    timestamp: new Date().toISOString(),
  })}\n\n`;

  for (const [userId, writer] of connections.entries()) {
    try {
      (writer as any).enqueue(message);
    } catch (error) {
      console.error(`Failed to send update to user ${userId}:`, error);
      connections.delete(userId);
    }
  }
}

// Function to send update to specific user
export function sendUpdateToUser(userId: string, data: any) {
  const writer = connections.get(userId);
  if (writer) {
    const message = `data: ${JSON.stringify({
      type: "conversation_update",
      data,
      timestamp: new Date().toISOString(),
    })}\n\n`;

    try {
      (writer as any).enqueue(message);
    } catch (error) {
      console.error(`Failed to send update to user ${userId}:`, error);
      connections.delete(userId);
    }
  }
}
