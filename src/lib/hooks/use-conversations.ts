"use client";

import { useState, useEffect, useCallback } from "react";
import { CommunicationChannel } from "@prisma/client";

interface Contact {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  tags: string[];
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  direction: "INBOUND" | "OUTBOUND";
  status: string;
  sender?: {
    id: string;
    name?: string;
  };
}

interface ConversationData {
  id: string;
  channel: CommunicationChannel;
  status: string;
  lastMessageAt?: string;
  unreadCount: number;
  contact: Contact;
  messages: Message[];
  _count: {
    messages: number;
  };
}

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      if (!conversations) {
        setLoading(true);
      }
      setError(null);

      const response = await fetch("/api/conversations");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch conversations");
      }

      setConversations(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load conversations"
      );
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const syncEmails = useCallback(async () => {
    try {
      const response = await fetch("/api/sync/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ folder: "INBOX" }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to sync emails");
      }

      // Refresh conversations after sync
      await fetchConversations();

      return {
        success: true,
        processedCount: result.data.processedCount,
        totalEmails: result.data.totalEmails,
      };
    } catch (err) {
      console.error("Failed to sync emails:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to sync emails",
      };
    }
  }, [fetchConversations]);

  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAsRead" }),
      });

      if (response.ok) {
        // Update local state
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
          )
        );
      }
    } catch (err) {
      console.error("Failed to mark conversation as read:", err);
    }
  }, []);

  const searchConversations = useCallback(async (query: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/conversations?query=${encodeURIComponent(query)}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to search conversations");
      }

      setConversations(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to search conversations"
      );
      console.error("Failed to search conversations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch

  useEffect(() => {
    fetchConversations();
  }, []);

  return {
    conversations,
    loading,
    error,
    fetchConversations,
    syncEmails,
    markAsRead,
    searchConversations,
  };
}
