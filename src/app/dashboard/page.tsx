"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/layout";
import ConversationList from "@/components/dashboard/conversation-list";
import MessageView from "@/components/dashboard/message-view";
import { sampleConversations, sampleMessages } from "@/lib/sample-data";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function DashboardPage() {
  const [selectedConversation, setSelectedConversation] = useState(
    sampleConversations[0].id
  );
  const [showMessages, setShowMessages] = useState(false);

  const currentConversation = sampleConversations.find(
    (c) => c.id === selectedConversation
  );

  const currentMessages =
    sampleMessages[selectedConversation as keyof typeof sampleMessages] || [];

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
    setShowMessages(true);
  };

  const handleBack = () => {
    setShowMessages(false);
  };

  return (
    <DashboardLayout>
      <div className="flex h-full">
        {/* Conversations List - Hidden on mobile/tablet when message is shown */}
        <div
          className={`${
            showMessages ? "hidden lg:block" : "block"
          } w-full lg:w-96 h-full`}
        >
          <ConversationList
            conversations={sampleConversations}
            selectedId={selectedConversation}
            onSelect={handleSelectConversation}
          />
        </div>

        {/* Message View - Full screen on mobile/tablet, side-by-side on desktop */}
        <div
          className={`${
            showMessages ? "block" : "hidden lg:block"
          } flex-1 h-full`}
        >
          <MessageView
            conversation={currentConversation}
            messages={currentMessages}
            onBack={handleBack}
            showBackButton={showMessages}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
