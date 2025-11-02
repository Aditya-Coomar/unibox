import { useEffect, useCallback, useRef } from "react";

export interface RealtimeMessage {
  type: string;
  message: {
    id: string;
    content: string;
    channel: string;
    direction: string;
    createdAt: string;
    status: string;
  };
  conversation: {
    id: string;
    lastMessageAt: string;
    unreadCount: number;
  };
  contact: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
  };
}

export interface RealtimeUpdate {
  type: "connected" | "heartbeat" | "conversation_update";
  data?: RealtimeMessage;
  timestamp: string;
}

export function useRealtimeUpdates(
  onUpdate?: (update: RealtimeUpdate) => void,
  enabled: boolean = true
) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = useRef(1000); // Start with 1 second

  const connect = useCallback(() => {
    if (!enabled || eventSourceRef.current) {
      return;
    }

    try {
      console.log("Connecting to real-time updates...");

      const eventSource = new EventSource("/api/conversations/updates", {
        withCredentials: true,
      });

      eventSource.onopen = () => {
        console.log("Real-time connection established");
        reconnectAttempts.current = 0;
        reconnectDelay.current = 1000; // Reset delay on successful connection
      };

      eventSource.onmessage = (event) => {
        try {
          const update: RealtimeUpdate = JSON.parse(event.data);
          console.log("Received real-time update:", update);

          if (onUpdate) {
            onUpdate(update);
          }

          // Handle specific update types
          if (update.type === "conversation_update" && update.data) {
            console.log("New message received:", update.data.message.id);
          }
        } catch (error) {
          console.error("Error parsing real-time update:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("Real-time connection error:", error);
        eventSource.close();
        eventSourceRef.current = null;

        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay =
            reconnectDelay.current * Math.pow(2, reconnectAttempts.current - 1);

          console.log(
            `Attempting reconnect ${reconnectAttempts.current}/${maxReconnectAttempts} in ${delay}ms`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error(
            "Max reconnection attempts reached. Real-time updates disabled."
          );
        }
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error("Failed to establish real-time connection:", error);
    }
  }, [enabled, onUpdate]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      console.log("Disconnecting from real-time updates");
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    reconnectAttempts.current = 0;
    reconnectDelay.current = 1000;
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      connect();
    }, 100);
  }, [disconnect, connect]);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, keep connection but reduce activity
        console.log("Page hidden - maintaining real-time connection");
      } else {
        // Page is visible, ensure connection is active
        console.log("Page visible - ensuring real-time connection");
        if (enabled && !eventSourceRef.current) {
          reconnect();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, reconnect]);

  return {
    isConnected: !!eventSourceRef.current,
    reconnect,
    disconnect,
  };
}
