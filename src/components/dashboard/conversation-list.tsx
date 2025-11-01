"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { MessageSquare, Mail, Smartphone } from "lucide-react";
import { Conversation } from "@/lib/sample-data";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: ConversationListProps) {
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "whatsapp":
        return <MessageSquare className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      case "sms":
        return <Smartphone className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case "whatsapp":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "email":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "sms":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-neutral-500/10 text-neutral-500 border-neutral-500/20";
    }
  };

  return (
    <div className="w-full lg:w-96 border-r border-neutral-800 flex flex-col bg-black h-full">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 shrink-0">
        <h2 className="text-lg font-semibold">Messages</h2>
        <p className="text-sm text-neutral-400 mt-1">
          {conversations.length} conversations
        </p>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation.id)}
            className={`w-full p-4 border-b border-neutral-800 hover:bg-neutral-900 transition-colors text-left ${
              selectedId === conversation.id ? "bg-neutral-900" : ""
            }`}
          >
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <Avatar className="h-12 w-12 bg-white text-black shrink-0">
                <div className="flex items-center justify-center w-full h-full text-sm font-semibold">
                  {conversation.contact.avatar}
                </div>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium truncate">
                    {conversation.contact.name}
                  </h3>
                  <span className="text-xs text-neutral-400 shrink-0 ml-2">
                    {conversation.lastMessageTime}
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
                    {conversation.channel}
                  </Badge>
                  {conversation.unreadCount > 0 && (
                    <Badge className="bg-white text-black text-xs px-2 py-0.5">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-neutral-400 truncate">
                  {conversation.lastMessage}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
