"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Video,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  MessageSquare,
  Mail,
  Smartphone,
  ArrowLeft,
} from "lucide-react";
import { Conversation, Message } from "@/lib/sample-data";

interface MessageViewProps {
  conversation?: Conversation;
  messages: Message[];
  onBack?: () => void;
  showBackButton?: boolean;
}

export default function MessageView({
  conversation,
  messages,
  onBack,
  showBackButton = false,
}: MessageViewProps) {
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black">
        <div className="text-center text-neutral-400">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

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

  const handleSend = () => {
    if (messageText.trim()) {
      // In a real app, this would send the message
      console.log("Sending message:", messageText);
      setMessageText("");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-black h-full">
      {/* Header */}
      <div className="h-16 border-b border-neutral-800 flex items-center justify-between px-4 md:px-6 shrink-0">
        <div className="flex items-center space-x-3">
          {/* Back button for mobile/tablet */}
          {showBackButton && onBack && (
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="lg:hidden -ml-2 text-neutral-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar className="h-10 w-10 bg-white text-black">
            <div className="flex items-center justify-center h-full w-full text-sm font-semibold">
              {conversation.contact.avatar}
            </div>
          </Avatar>
          <div>
            <h2 className="font-semibold">{conversation.contact.name}</h2>
            <div className="flex items-center space-x-2">
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
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-neutral-400 hover:text-white"
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-neutral-400 hover:text-white"
          >
            <Video className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-neutral-400 hover:text-white"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] ${
                message.sender === "user" ? "order-2" : "order-1"
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.sender === "user"
                    ? "bg-white text-black"
                    : "bg-neutral-900 text-white"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
              <div
                className={`flex items-center space-x-2 mt-1 text-xs text-neutral-400 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <span>{message.timestamp}</span>
                {message.sender === "user" && (
                  <span className="capitalize">• {message.status}</span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-neutral-800 p-4 shrink-0">
        <div className="flex items-end space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-neutral-400 hover:text-white"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <div className="flex-1 relative">
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Send a message via ${conversation.channel}...`}
              className="min-h-[44px] max-h-32 bg-neutral-900 border-neutral-800 focus:border-white resize-none pr-10"
              rows={1}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 bottom-2 text-neutral-400 hover:text-white"
            >
              <Smile className="h-5 w-5" />
            </Button>
          </div>

          <Button
            onClick={handleSend}
            disabled={!messageText.trim()}
            className="bg-white text-black hover:bg-neutral-200 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>

        <div className="mt-2 text-xs text-neutral-400 text-center">
          Press Enter to send, Shift + Enter for new line
        </div>
      </div>
    </div>
  );
}
