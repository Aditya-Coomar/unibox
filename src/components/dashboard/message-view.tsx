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
  RefreshCw,
  X,
} from "lucide-react";
import { CommunicationChannel } from "@prisma/client";
import FileUpload from "@/components/messaging/file-upload";
import { useRealtimeUpdates } from "@/lib/hooks/use-realtime-updates";
import toast from "react-hot-toast";

interface Contact {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  tags: string[];
  customFields?: any;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  direction: "INBOUND" | "OUTBOUND";
  status: string;
  metadata?: any;
  sender?: {
    id: string;
    name?: string;
    image?: string;
  };
  attachments: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }>;
}

interface ConversationDetails {
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

interface MessageViewProps {
  conversationId: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

export default function MessageView({
  conversationId,
  onBack,
  showBackButton = false,
}: MessageViewProps) {
  const [messageText, setMessageText] = useState("");
  const [conversation, setConversation] = useState<ConversationDetails | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showAttachments, setShowAttachments] = useState(false);
  const [scrollAfterFetch, setScrollAfterFetch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversation = async () => {
    if (!conversationId) return;

    try {
      if (!conversation || conversation.id !== conversationId) {
        setLoading(true);
        setScrollAfterFetch(true);
      }
      setError(null);
      const response = await fetch(
        `/api/conversations/${conversationId}?includeMessages=true`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch conversation");
      }

      setConversation(result.data);

      // Mark as read
      await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAsRead" }),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load conversation"
      );
      console.error("Failed to fetch conversation:", err);
    } finally {
      setLoading(false);
      if (scrollAfterFetch) {
        scrollToBottom();
      }
    }
  };

  // Set up real-time updates for this conversation
  useRealtimeUpdates(
    (update) => {
      if (update.type === "heartbeat") {
        setTimeout(() => {
          fetchConversation().then(() => {
            // Scroll to bottom after fetching new messages
            setTimeout(scrollToBottom, 100);
          });
        }, 200); // 200ms delay to ensure database consistency
      }
    },
    !!conversationId // Only enable if we have a conversation ID
  );

  useEffect(() => {
    fetchConversation();
  }, [conversationId]);

  useEffect(() => {
    if (conversation?.messages) {
      scrollToBottom();
    }
  }, [conversation?.messages]);

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black h-full">
        <div className="text-center text-neutral-400">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black h-full">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black h-full">
        <div className="text-center text-neutral-400">
          <p className="text-red-500 mb-2">
            {error || "Conversation not found"}
          </p>
          <Button onClick={fetchConversation} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      </div>
    );
  }

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
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSend = async () => {
    if ((!messageText.trim() && attachments.length === 0) || sending) return;

    try {
      setSending(true);

      // For email with attachments, use the message send API with FormData
      if (
        conversation.channel === CommunicationChannel.EMAIL &&
        attachments.length > 0
      ) {
        const formData = new FormData();
        formData.append("contactId", conversation.contact.id);
        formData.append("content", messageText.trim());
        formData.append("channel", conversation.channel);

        const subject = `Re: ${
          conversation.messages[0]?.metadata?.subject || "Message from UniBox"
        }`;
        formData.append("subject", subject);

        // Append each attachment
        attachments.forEach((file) => {
          formData.append("attachments", file);
        });

        const response = await fetch("/api/messages/send", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to send message");
        }
      } else {
        // Regular conversation API for messages without attachments
        const subject =
          conversation.channel === CommunicationChannel.EMAIL
            ? `Re: ${
                conversation.messages[0]?.metadata?.subject ||
                "Message from UniBox"
              }`
            : undefined;

        const response = await fetch(`/api/conversations/${conversationId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: messageText,
            subject: subject,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to send message");
        }
      }

      // Reset form
      setMessageText("");
      setAttachments([]);
      setShowAttachments(false);

      // first update the message state optimistically
      setConversation((prev) =>
        prev
          ? {
              ...prev,
              messages: [
                ...prev.messages,
                {
                  id: Date.now().toString(),
                  content: messageText,
                  direction: "OUTBOUND",
                  createdAt: new Date().toISOString(),
                  status: "SENDING",
                  attachments: [],
                },
              ],
            }
          : prev
      );
      scrollToBottom();
      // Refresh the conversation to show the new message
      await fetchConversation();
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to send message"
      );
    } finally {
      setSending(false);
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
              {getContactInitials(conversation.contact)}
            </div>
          </Avatar>
          <div>
            <h2 className="font-semibold">
              {getContactName(conversation.contact)}
            </h2>
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
                {conversation.channel.toLowerCase()}
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
        {conversation.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.direction === "OUTBOUND" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] ${
                message.direction === "OUTBOUND" ? "order-2" : "order-1"
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.direction === "OUTBOUND"
                    ? "bg-white text-black"
                    : "bg-neutral-900 text-white"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="text-xs opacity-75 flex items-center gap-1"
                      >
                        <Paperclip className="h-3 w-3" />
                        {attachment.fileUrl.startsWith("#attachment-") ? (
                          <span className="text-blue-400">
                            {attachment.fileName} (sent)
                          </span>
                        ) : (
                          <a
                            href={attachment.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-blue-400 hover:text-blue-300"
                          >
                            {attachment.fileName}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div
                className={`flex items-center space-x-2 mt-1 text-xs text-neutral-400 ${
                  message.direction === "OUTBOUND"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <span>{formatTime(message.createdAt)}</span>
                {message.direction === "OUTBOUND" && (
                  <span className="capitalize">
                    • {message.status.toLowerCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-neutral-800 p-4 shrink-0">
        {/* File Upload Area - Only show for email conversations */}
        {conversation.channel === CommunicationChannel.EMAIL &&
          showAttachments && (
            <div className="mb-4 p-3 bg-neutral-900 rounded-lg border border-neutral-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">
                  Attachment
                </span>
                <Button
                  onClick={() => setShowAttachments(false)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-neutral-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <FileUpload
                onFilesChange={setAttachments}
                maxFiles={1}
                maxFileSize={5}
                acceptedTypes={[
                  "image/*",
                  ".pdf",
                  ".doc",
                  ".docx",
                  ".txt",
                  ".xlsx",
                  ".csv",
                ]}
              />
            </div>
          )}

        <div className="flex items-end space-x-2">
          {/* Attachment button - only show for email conversations */}
          {conversation.channel === CommunicationChannel.EMAIL && (
            <Button
              onClick={() => setShowAttachments(!showAttachments)}
              variant="ghost"
              size="sm"
              className={`text-neutral-400 hover:text-white ${
                showAttachments || attachments.length > 0
                  ? "text-white bg-neutral-800"
                  : ""
              }`}
            >
              <Paperclip className="h-5 w-5" />
              {attachments.length > 0 && (
                <span className="ml-1 text-xs">{attachments.length}</span>
              )}
            </Button>
          )}

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
            disabled={
              (!messageText.trim() && attachments.length === 0) || sending
            }
            className="bg-white text-black hover:bg-neutral-200 disabled:opacity-50"
          >
            {sending ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>

        <div className="mt-2 text-xs text-neutral-400 text-center">
          Press Enter to send, Shift + Enter for new line
          {conversation.channel === CommunicationChannel.EMAIL && (
            <> • Click paperclip to attach files</>
          )}
        </div>
      </div>
    </div>
  );
}
