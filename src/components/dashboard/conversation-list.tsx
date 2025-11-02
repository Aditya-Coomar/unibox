"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Mail,
  Smartphone,
  Phone,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { CommunicationChannel } from "@prisma/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useConversations } from "@/lib/hooks/use-conversations";
import { useRealtimeUpdates } from "@/lib/hooks/use-realtime-updates";

interface Contact {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  tags: string[];
}

interface ConversationListProps {
  selectedId?: string;
  onSelect: (id: string) => void;
}

export default function ConversationList({
  selectedId,
  onSelect,
}: ConversationListProps) {
  const {
    conversations,
    loading,
    error,
    fetchConversations,
    syncEmails,
    searchConversations,
    markAsRead,
  } = useConversations();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [syncingEmails, setSyncingEmails] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Set up real-time updates
  useRealtimeUpdates(
    (update) => {
      if (update.type === "heartbeat") {
        console.log("Real-time update received:", update.data);
        // Refresh conversations to get the new message
        setTimeout(() => {
          fetchConversations();
        }, 100); // Small delay to ensure the database has been updated
      }
    },
    true // Enable real-time updates
  );

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      await searchConversations(query);
      setIsSearching(false);
    } else {
      await fetchConversations();
    }
  };

  const handleSyncEmails = async () => {
    setSyncingEmails(true);
    const result = await syncEmails();
    setSyncingEmails(false);

    if (result.success) {
      // Show success feedback (you could add a toast notification here)
      console.log(`Synced ${result.processedCount} new emails`);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    onSelect(conversationId);
    // Mark conversation as read when selected
    markAsRead(conversationId);
  };

  const clearSearch = () => {
    setSearchQuery("");
    fetchConversations();
  };

  const getChannelIcon = (channel: CommunicationChannel) => {
    switch (channel) {
      case CommunicationChannel.WHATSAPP:
        return <MessageSquare className="h-4 w-4" />;
      case CommunicationChannel.EMAIL:
        return <Mail className="h-4 w-4" />;
      case CommunicationChannel.SMS:
        return <Smartphone className="h-4 w-4" />;
      case CommunicationChannel.VOICE_CALL:
        return <Phone className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getChannelColor = (channel: CommunicationChannel) => {
    switch (channel) {
      case CommunicationChannel.WHATSAPP:
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case CommunicationChannel.EMAIL:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case CommunicationChannel.SMS:
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case CommunicationChannel.VOICE_CALL:
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      default:
        return "bg-neutral-500/10 text-neutral-500 border-neutral-500/20";
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const getContactName = (contact: Contact) => {
    if (contact.firstName || contact.lastName) {
      return `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
    }
    return (
      contact.email ||
      contact.phone ||
      contact.whatsappNumber ||
      "Unknown Contact"
    );
  };

  const getContactInitials = (contact: Contact) => {
    const name = getContactName(contact);
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Filter conversations based on status
  const filteredConversations = conversations.filter((conversation) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "unread") return conversation.unreadCount > 0;
    if (statusFilter === "recent") {
      if (!conversation.lastMessageAt) return false;
      const lastMessage = new Date(conversation.lastMessageAt);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return lastMessage > yesterday;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="w-full lg:w-96 border-r border-neutral-800 flex flex-col bg-black h-full">
        <div className="p-4 border-b border-neutral-800">
          <h2 className="text-lg font-semibold">Messages</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full lg:w-96 border-r border-neutral-800 flex flex-col bg-black h-full">
        <div className="p-4 border-b border-neutral-800">
          <h2 className="text-lg font-semibold">Messages</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-red-500 mb-2">{error}</p>
            <Button onClick={fetchConversations} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-96 border-r border-neutral-800 flex flex-col bg-black h-full">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold">Messages</h2>
            <p className="text-sm text-neutral-400 mt-1">
              {conversations.length} conversations
            </p>
          </div>
          <Button
            onClick={handleSyncEmails}
            disabled={syncingEmails}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Sync emails"
          >
            <RefreshCw
              className={`h-4 w-4 ${syncingEmails ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search conversations..."
            className="pl-10 pr-10 bg-neutral-900 border-neutral-700 focus:border-white"
          />
          {searchQuery && (
            <Button
              onClick={clearSearch}
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-neutral-400 hover:text-white"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <RefreshCw className="h-4 w-4 animate-spin text-neutral-400" />
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex gap-1 overflow-x-auto">
          {[
            { key: "all", label: "All", count: conversations.length },
            {
              key: "unread",
              label: "Unread",
              count: conversations.filter((c) => c.unreadCount > 0).length,
            },
            {
              key: "recent",
              label: "Recent",
              count: conversations.filter((c) => {
                if (!c.lastMessageAt) return false;
                const lastMessage = new Date(c.lastMessageAt);
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                return lastMessage > yesterday;
              }).length,
            },
          ].map((filter) => (
            <Button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              variant={statusFilter === filter.key ? "default" : "ghost"}
              size="sm"
              className={`shrink-0 text-xs h-7 ${
                statusFilter === filter.key
                  ? "bg-white text-black hover:bg-neutral-200"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              {filter.label} ({filter.count})
            </Button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredConversations.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center text-neutral-400">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>
                {searchQuery
                  ? "No conversations found"
                  : statusFilter !== "all"
                  ? `No ${statusFilter} conversations`
                  : "No conversations yet"}
              </p>
              {!searchQuery && conversations.length === 0 && (
                <Button
                  onClick={handleSyncEmails}
                  disabled={syncingEmails}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  {syncingEmails ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Syncing...
                    </>
                  ) : (
                    "Sync Emails"
                  )}
                </Button>
              )}
            </div>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => handleSelectConversation(conversation.id)}
              className={`w-full p-4 border-b border-neutral-800 hover:bg-neutral-900 transition-colors text-left ${
                selectedId === conversation.id ? "bg-neutral-900" : ""
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Avatar */}
                <Avatar className="h-12 w-12 bg-white text-black shrink-0">
                  <div className="flex items-center justify-center w-full h-full text-sm font-semibold">
                    {getContactInitials(conversation.contact)}
                  </div>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium truncate">
                      {getContactName(conversation.contact)}
                    </h3>
                    <span className="text-xs text-neutral-400 shrink-0 ml-2">
                      {formatTime(conversation.lastMessageAt)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 mb-2">
                    <Badge
                      variant="outline"
                      className={`${getChannelColor(
                        conversation.channel
                      )} text-xs px-2 py-0.5`}
                    >
                      <span className="mr-1">
                        {getChannelIcon(conversation.channel)}
                      </span>
                      {conversation.channel.toLowerCase()}
                    </Badge>
                    {conversation.unreadCount > 0 && (
                      <Badge className="bg-white text-black text-xs px-2 py-0.5">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-neutral-400 truncate">
                    {conversation.messages[0]?.content || "No messages"}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
