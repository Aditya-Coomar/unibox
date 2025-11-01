"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Mail, Phone, Calendar, Send } from "lucide-react";

interface Contact {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
}

interface SendMessageFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact;
  onSend: (data: {
    contactId: string;
    content: string;
    channel: "SMS" | "WHATSAPP" | "EMAIL";
    scheduledFor?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function SendMessageForm({
  open,
  onOpenChange,
  contact,
  onSend,
  isLoading = false,
}: SendMessageFormProps) {
  const [content, setContent] = useState("");
  const [channel, setChannel] = useState<"SMS" | "WHATSAPP" | "EMAIL">("SMS");
  const [scheduledFor, setScheduledFor] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [subject, setSubject] = useState("");

  // Get available channels based on contact information
  const getAvailableChannels = () => {
    const channels = [];

    if (contact.phone) {
      channels.push({
        value: "SMS" as const,
        label: "SMS",
        icon: MessageSquare,
        available: true,
        info: contact.phone,
      });

      channels.push({
        value: "WHATSAPP" as const,
        label: "WhatsApp",
        icon: MessageSquare,
        available: true,
        info: contact.whatsappNumber || contact.phone,
      });
    }

    if (contact.email) {
      channels.push({
        value: "EMAIL" as const,
        label: "Email",
        icon: Mail,
        available: true,
        info: contact.email,
      });
    }

    return channels;
  };

  const availableChannels = getAvailableChannels();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    const messageData: any = {
      contactId: contact.id,
      content: content.trim(),
      channel,
    };

    if (isScheduled && scheduledFor) {
      messageData.scheduledFor = scheduledFor;
    }

    await onSend(messageData);

    // Reset form
    setContent("");
    setSubject("");
    setScheduledFor("");
    setIsScheduled(false);
    onOpenChange(false);
  };

  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case "SMS":
      case "WHATSAPP":
        return MessageSquare;
      case "EMAIL":
        return Mail;
      default:
        return MessageSquare;
    }
  };

  const getChannelColor = (channelType: string) => {
    switch (channelType) {
      case "SMS":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "WHATSAPP":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "EMAIL":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  if (availableChannels.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] bg-neutral-900 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              Cannot Send Message
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              This contact doesn't have any communication channels configured.
              Please add an email address or phone number to send messages.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-white text-black hover:bg-neutral-200"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-neutral-900 border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-white">
            Send Message to {contact.firstName} {contact.lastName}
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            Choose a channel and compose your message.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Channel Selection */}
          <div className="space-y-2">
            <Label className="text-neutral-200">Channel</Label>
            <div className="grid grid-cols-1 gap-2">
              {availableChannels.map((ch) => {
                const Icon = ch.icon;
                return (
                  <button
                    key={ch.value}
                    type="button"
                    onClick={() => setChannel(ch.value)}
                    className={`p-3 rounded-lg border transition-colors text-left ${
                      channel === ch.value
                        ? getChannelColor(ch.value)
                        : "border-neutral-800 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <div>
                        <div className="font-medium text-white">{ch.label}</div>
                        <div className="text-sm text-neutral-400">
                          {ch.info}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject for Email */}
          {channel === "EMAIL" && (
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-neutral-200">
                Subject
              </Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-black border-neutral-800 text-white focus:border-white"
                placeholder="Enter email subject..."
              />
            </div>
          )}

          {/* Message Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-neutral-200">
              Message
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-black border-neutral-800 text-white focus:border-white min-h-[100px]"
              placeholder={`Type your ${channel.toLowerCase()} message...`}
              rows={4}
            />
            <div className="text-sm text-neutral-400">
              {content.length}/1000 characters
            </div>
          </div>

          {/* Schedule Option */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="schedule"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="rounded border-neutral-800"
                aria-label="Schedule message for later"
              />
              <Label htmlFor="schedule" className="text-neutral-200">
                Schedule message
              </Label>
            </div>

            {isScheduled && (
              <Input
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="bg-black border-neutral-800 text-white focus:border-white"
                min={new Date().toISOString().slice(0, 16)}
              />
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-neutral-800 hover:bg-neutral-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !content.trim()}
              className="bg-white text-black hover:bg-neutral-200"
            >
              {isLoading ? (
                "Sending..."
              ) : isScheduled ? (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send {channel}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
