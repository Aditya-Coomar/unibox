"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/layout";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search,
  Plus,
  Mail,
  Phone,
  MessageSquare,
  MoreVertical,
  Filter,
} from "lucide-react";
import { sampleConversations } from "@/lib/sample-data";

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const contacts = sampleConversations.map((conv) => conv.contact);

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="h-full overflow-y-auto p-6 bg-black">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Contacts</h1>
              <p className="text-neutral-400">
                Manage your customer contacts and relationships
              </p>
            </div>
            <Button className="bg-white text-black hover:bg-neutral-200">
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>

          {/* Search and Filters */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <Input
                    type="search"
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-black border-neutral-800 focus:border-white"
                  />
                </div>
                <Button
                  variant="outline"
                  className="border-neutral-800 hover:bg-neutral-800"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-neutral-400">
                  Total Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{contacts.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-neutral-400">
                  Active This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {Math.floor(contacts.length * 0.6)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-neutral-400">
                  New This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {Math.floor(contacts.length * 0.25)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contacts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map((contact) => {
              const conversation = sampleConversations.find(
                (c) => c.contact.id === contact.id
              );
              return (
                <Card
                  key={contact.id}
                  className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors"
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12 bg-white text-black">
                        <div className="flex items-center justify-center h-full font-semibold">
                          {contact.avatar}
                        </div>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{contact.name}</h3>
                        {conversation && (
                          <Badge
                            variant="outline"
                            className={`text-xs mt-1 ${
                              conversation.channel === "whatsapp"
                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                : conversation.channel === "email"
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                : "bg-purple-500/10 text-purple-500 border-purple-500/20"
                            }`}
                          >
                            {conversation.channel}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-neutral-400 hover:text-white"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {contact.email && (
                      <div className="flex items-center space-x-2 text-sm text-neutral-400">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center space-x-2 text-sm text-neutral-400">
                        <Phone className="h-4 w-4" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    <div className="pt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-neutral-800 hover:bg-neutral-800"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-neutral-800 hover:bg-neutral-800"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredContacts.length === 0 && (
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="py-12 text-center">
                <p className="text-neutral-400">No contacts found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
