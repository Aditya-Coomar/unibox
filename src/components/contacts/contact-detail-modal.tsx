"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Mail,
  Phone,
  MessageSquare,
  Edit,
  Calendar,
  Tag,
  User,
  Clock,
} from "lucide-react";
import { ContactNotes } from "./contact-notes";
import { SendMessageForm } from "@/components/messaging/send-message-form";

interface Contact {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  tags: string[];
  customFields?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  conversations?: Array<{
    id: string;
    channel: string;
    status: string;
    lastMessageAt?: string;
    unreadCount: number;
    messages: Array<{
      id: string;
      content: string;
      createdAt: string;
      direction: string;
      status: string;
      sender?: {
        id: string;
        name: string;
      };
    }>;
  }>;
  notes?: Array<{
    id: string;
    content: string;
    isPrivate: boolean;
    createdAt: string;
    author: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

interface ContactDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
  onEdit: (contact: Contact) => void;
  onSendMessage: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export function ContactDetailModal({
  open,
  onOpenChange,
  contact,
  onEdit,
  onSendMessage,
  isLoading = false,
}: ContactDetailModalProps) {
  const [isMessageFormOpen, setIsMessageFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  if (!contact) return null;

  const getContactName = () => {
    return (
      `${contact.firstName || ""} ${contact.lastName || ""}`.trim() ||
      "Unnamed Contact"
    );
  };

  const getContactInitials = () => {
    const firstName = contact.firstName || "";
    const lastName = contact.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getChannelBadgeColor = (channel: string) => {
    switch (channel.toUpperCase()) {
      case "SMS":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "WHATSAPP":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "EMAIL":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const hasContactMethods =
    contact.email || contact.phone || contact.whatsappNumber;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] bg-neutral-900 border-neutral-800 overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 bg-white text-black">
                <div className="flex items-center justify-center w-full h-full text-xl font-semibold">
                  {getContactInitials()}
                </div>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl text-white">
                  {getContactName()}
                </DialogTitle>
                <DialogDescription className="text-neutral-400 mt-1">
                  Contact details and communication history
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setIsMessageFormOpen(true)}
                disabled={!hasContactMethods}
                size="sm"
                className="bg-white text-black hover:bg-neutral-200"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button
                onClick={() => onEdit(contact)}
                variant="outline"
                size="sm"
                className="border-neutral-700 hover:bg-neutral-800"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full"
          >
            <TabsList className="grid w-full grid-cols-3 bg-neutral-800">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-neutral-700"
              >
                <User className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="conversations"
                className="data-[state=active]:bg-neutral-700"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Conversations
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="data-[state=active]:bg-neutral-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Notes
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 max-h-[calc(90vh-200px)] overflow-y-auto">
              <TabsContent value="overview" className="space-y-4">
                {/* Contact Information */}
                <Card className="bg-neutral-800 border-neutral-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {contact.email && (
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-neutral-400" />
                          <div>
                            <div className="text-sm text-neutral-400">
                              Email
                            </div>
                            <div className="text-white">{contact.email}</div>
                          </div>
                        </div>
                      )}

                      {contact.phone && (
                        <div className="flex items-center space-x-3">
                          <Phone className="h-5 w-5 text-neutral-400" />
                          <div>
                            <div className="text-sm text-neutral-400">
                              Phone
                            </div>
                            <div className="text-white">{contact.phone}</div>
                          </div>
                        </div>
                      )}

                      {contact.whatsappNumber &&
                        contact.whatsappNumber !== contact.phone && (
                          <div className="flex items-center space-x-3">
                            <MessageSquare className="h-5 w-5 text-neutral-400" />
                            <div>
                              <div className="text-sm text-neutral-400">
                                WhatsApp
                              </div>
                              <div className="text-white">
                                {contact.whatsappNumber}
                              </div>
                            </div>
                          </div>
                        )}

                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-neutral-400" />
                        <div>
                          <div className="text-sm text-neutral-400">
                            Created
                          </div>
                          <div className="text-white">
                            {formatDate(contact.createdAt)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-neutral-400" />
                        <div>
                          <div className="text-sm text-neutral-400">
                            Last Updated
                          </div>
                          <div className="text-white">
                            {formatDate(contact.updatedAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {contact.tags.length > 0 && (
                      <div className="flex items-center space-x-3">
                        <Tag className="h-5 w-5 text-neutral-400" />
                        <div>
                          <div className="text-sm text-neutral-400 mb-2">
                            Tags
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {contact.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="bg-neutral-700 text-neutral-200 border-neutral-600"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Custom Fields */}
                    {contact.customFields &&
                      Object.keys(contact.customFields).length > 0 && (
                        <div className="mt-4">
                          <div className="text-sm text-neutral-400 mb-2">
                            Custom Fields
                          </div>
                          <div className="space-y-2">
                            {Object.entries(contact.customFields).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="flex justify-between items-center p-2 bg-neutral-700 rounded"
                                >
                                  <span className="text-sm text-neutral-300">
                                    {key}
                                  </span>
                                  <span className="text-sm text-white">
                                    {String(value)}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="bg-neutral-800 border-neutral-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">
                      Recent Activity
                    </CardTitle>
                    <CardDescription className="text-neutral-400">
                      Latest conversations and interactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {contact.conversations &&
                    contact.conversations.length > 0 ? (
                      <div className="space-y-3">
                        {contact.conversations
                          .slice(0, 3)
                          .map((conversation) => (
                            <div
                              key={conversation.id}
                              className="p-3 bg-neutral-700 rounded-lg"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <Badge
                                  variant="outline"
                                  className={getChannelBadgeColor(
                                    conversation.channel
                                  )}
                                >
                                  {conversation.channel}
                                </Badge>
                                <div className="text-xs text-neutral-400">
                                  {conversation.lastMessageAt &&
                                    formatDate(conversation.lastMessageAt)}
                                </div>
                              </div>
                              {conversation.messages.length > 0 && (
                                <div className="text-sm text-neutral-200">
                                  {conversation.messages[0].content.slice(
                                    0,
                                    100
                                  )}
                                  {conversation.messages[0].content.length >
                                    100 && "..."}
                                </div>
                              )}
                              {conversation.unreadCount > 0 && (
                                <Badge
                                  variant="outline"
                                  className="mt-2 bg-blue-500/10 text-blue-400 border-blue-500/20"
                                >
                                  {conversation.unreadCount} unread
                                </Badge>
                              )}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-neutral-400">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No recent activity</p>
                        <p className="text-sm mt-1">
                          Start a conversation to see activity here
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="conversations">
                <Card className="bg-neutral-800 border-neutral-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">
                      All Conversations
                    </CardTitle>
                    <CardDescription className="text-neutral-400">
                      Complete communication history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {contact.conversations &&
                    contact.conversations.length > 0 ? (
                      <div className="space-y-4">
                        {contact.conversations.map((conversation) => (
                          <div
                            key={conversation.id}
                            className="p-4 bg-neutral-700 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <Badge
                                variant="outline"
                                className={getChannelBadgeColor(
                                  conversation.channel
                                )}
                              >
                                {conversation.channel}
                              </Badge>
                              <div className="text-xs text-neutral-400">
                                {conversation.messages.length} messages
                              </div>
                            </div>
                            <div className="space-y-2">
                              {conversation.messages
                                .slice(0, 3)
                                .map((message) => (
                                  <div key={message.id} className="text-sm">
                                    <div className="flex items-center justify-between mb-1">
                                      <span
                                        className={
                                          message.direction === "OUTBOUND"
                                            ? "text-blue-400"
                                            : "text-green-400"
                                        }
                                      >
                                        {message.direction === "OUTBOUND"
                                          ? `You${
                                              message.sender?.name
                                                ? ` (${message.sender.name})`
                                                : ""
                                            }`
                                          : getContactName()}
                                      </span>
                                      <span className="text-xs text-neutral-400">
                                        {formatDate(message.createdAt)}
                                      </span>
                                    </div>
                                    <div className="text-neutral-200">
                                      {message.content}
                                    </div>
                                  </div>
                                ))}
                              {conversation.messages.length > 3 && (
                                <div className="text-xs text-neutral-400 text-center py-1">
                                  +{conversation.messages.length - 3} more
                                  messages
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-neutral-400">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No conversations yet</p>
                        <p className="text-sm mt-1">
                          Send the first message to start a conversation
                        </p>
                        <Button
                          onClick={() => setIsMessageFormOpen(true)}
                          disabled={!hasContactMethods}
                          className="mt-4 bg-white text-black hover:bg-neutral-200"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Message
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes">
                <ContactNotes
                  contactId={contact.id}
                  contactName={getContactName()}
                />
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Send Message Modal */}
      <SendMessageForm
        open={isMessageFormOpen}
        onOpenChange={setIsMessageFormOpen}
        contact={contact}
        onSend={onSendMessage}
        isLoading={isLoading}
      />
    </>
  );
}
