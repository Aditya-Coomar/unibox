"use client";

import { useState, useEffect } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Mail,
  Phone,
  MessageSquare,
  MoreVertical,
  Filter,
  Edit,
  Trash2,
} from "lucide-react";
import { ContactForm } from "@/components/contacts/contact-form";
import { SendMessageForm } from "@/components/messaging/send-message-form";
import toast from "react-hot-toast";

interface Contact {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [isMessageFormOpen, setIsMessageFormOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Fetch contacts from API
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/contacts");
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
      } else {
        toast.error("Failed to fetch contacts");
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const fullName = `${contact.firstName || ""} ${
      contact.lastName || ""
    }`.trim();
    const searchTerm = searchQuery.toLowerCase();
    return (
      fullName.toLowerCase().includes(searchTerm) ||
      contact.email?.toLowerCase().includes(searchTerm) ||
      contact.phone?.includes(searchQuery) ||
      contact.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
    );
  });

  const handleCreateContact = async (data: any) => {
    setFormLoading(true);
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newContact = await response.json();
        setContacts((prev) => [newContact, ...prev]);
        toast.success("Contact created successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create contact");
      }
    } catch (error) {
      console.error("Error creating contact:", error);
      toast.error("Failed to create contact");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateContact = async (data: any) => {
    if (!selectedContact) return;

    setFormLoading(true);
    try {
      const response = await fetch(`/api/contacts/${selectedContact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedContact = await response.json();
        setContacts((prev) =>
          prev.map((contact) =>
            contact.id === selectedContact.id ? updatedContact : contact
          )
        );
        setSelectedContact(null);
        toast.success("Contact updated successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update contact");
      }
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.error("Failed to update contact");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setContacts((prev) =>
          prev.filter((contact) => contact.id !== contactId)
        );
        toast.success("Contact deleted successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete contact");
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Failed to delete contact");
    }
  };

  const handleSendMessage = async (data: any) => {
    setFormLoading(true);
    try {
      let response;

      // Check if data is FormData (has attachments) or regular object
      if (data instanceof FormData) {
        // Send as FormData for file attachments
        response = await fetch("/api/messages/send", {
          method: "POST",
          body: data,
        });
      } else {
        // Send as JSON for regular messages
        response = await fetch("/api/messages/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }

      if (response.ok) {
        const result = await response.json();
        if (result.status === "sent") {
          const channel =
            data instanceof FormData ? data.get("channel") : data.channel;
          toast.success(`${channel} message sent successfully!`);
        } else if (result.status === "scheduled") {
          toast.success("Message scheduled successfully!");
        } else {
          toast.error(result.error || "Failed to send message");
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setFormLoading(false);
    }
  };

  const openEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsContactFormOpen(true);
  };

  const openSendMessage = (contact: Contact) => {
    setSelectedContact(contact);
    setIsMessageFormOpen(true);
  };

  const getContactName = (contact: Contact) => {
    return (
      `${contact.firstName || ""} ${contact.lastName || ""}`.trim() ||
      "Unnamed Contact"
    );
  };

  const getContactInitials = (contact: Contact) => {
    const firstName = contact.firstName || "";
    const lastName = contact.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";
  };

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
            <Button
              onClick={() => setIsContactFormOpen(true)}
              className="bg-white text-black hover:bg-neutral-200"
            >
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
          {loading ? (
            <div className="text-center py-12">
              <div className="text-neutral-400">Loading contacts...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContacts.map((contact) => (
                <Card
                  key={contact.id}
                  className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors"
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12 bg-white text-black">
                        <div className="flex items-center justify-center w-full h-full font-semibold">
                          {getContactInitials(contact)}
                        </div>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">
                          {getContactName(contact)}
                        </h3>
                        {contact.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {contact.tags.slice(0, 2).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs bg-neutral-800 text-neutral-300 border-neutral-700"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {contact.tags.length > 2 && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-neutral-800 text-neutral-300 border-neutral-700"
                              >
                                +{contact.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-neutral-400 hover:text-white"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-neutral-900 border-neutral-800">
                        <DropdownMenuItem
                          onClick={() => openEditContact(contact)}
                          className="text-neutral-300 hover:bg-neutral-800"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Contact
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openSendMessage(contact)}
                          className="text-neutral-300 hover:bg-neutral-800"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-red-400 hover:bg-neutral-800"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Contact
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                    {contact.whatsappNumber &&
                      contact.whatsappNumber !== contact.phone && (
                        <div className="flex items-center space-x-2 text-sm text-neutral-400">
                          <MessageSquare className="h-4 w-4" />
                          <span className="truncate">
                            WhatsApp: {contact.whatsappNumber}
                          </span>
                        </div>
                      )}
                    <div className="pt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openSendMessage(contact)}
                        className="flex-1 border-neutral-800 hover:bg-neutral-800"
                        disabled={!contact.email && !contact.phone}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditContact(contact)}
                        className="flex-1 border-neutral-800 hover:bg-neutral-800"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredContacts.length === 0 && (
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="py-12 text-center">
                <p className="text-neutral-400">
                  {searchQuery
                    ? "No contacts found matching your search"
                    : "No contacts yet"}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setIsContactFormOpen(true)}
                    className="mt-4 bg-white text-black hover:bg-neutral-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Contact
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Contact Form Modal */}
      <ContactForm
        open={isContactFormOpen}
        onOpenChange={(open) => {
          setIsContactFormOpen(open);
          if (!open) setSelectedContact(null);
        }}
        contact={selectedContact || undefined}
        onSubmit={selectedContact ? handleUpdateContact : handleCreateContact}
        isLoading={formLoading}
      />

      {/* Send Message Modal */}
      {selectedContact && (
        <SendMessageForm
          open={isMessageFormOpen}
          onOpenChange={setIsMessageFormOpen}
          contact={selectedContact}
          onSend={handleSendMessage}
          isLoading={formLoading}
        />
      )}
    </DashboardLayout>
  );
}
