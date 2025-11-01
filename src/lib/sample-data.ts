export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface Conversation {
  id: string;
  contact: Contact;
  channel: "sms" | "whatsapp" | "email";
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: "active" | "archived" | "snoozed";
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  sender: "user" | "contact";
  timestamp: string;
  channel: "sms" | "whatsapp" | "email";
  status: "sent" | "delivered" | "read" | "failed";
  attachments?: Array<{
    type: "image" | "document" | "video";
    url: string;
    name: string;
  }>;
}

export const sampleConversations: Conversation[] = [
  {
    id: "1",
    contact: {
      id: "c1",
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "+1 (555) 123-4567",
      avatar: "SJ",
    },
    channel: "whatsapp",
    lastMessage: "Thanks for the quick response! I'll check that out.",
    lastMessageTime: "2 min ago",
    unreadCount: 0,
    status: "active",
  },
  {
    id: "2",
    contact: {
      id: "c2",
      name: "Michael Chen",
      email: "m.chen@techcorp.com",
      phone: "+1 (555) 234-5678",
      avatar: "MC",
    },
    channel: "email",
    lastMessage: "Could we schedule a meeting to discuss the proposal?",
    lastMessageTime: "15 min ago",
    unreadCount: 2,
    status: "active",
  },
  {
    id: "3",
    contact: {
      id: "c3",
      name: "Emma Wilson",
      email: "emma.w@startup.io",
      phone: "+1 (555) 345-6789",
      avatar: "EW",
    },
    channel: "sms",
    lastMessage: "Perfect! See you tomorrow at 10 AM.",
    lastMessageTime: "1 hour ago",
    unreadCount: 0,
    status: "active",
  },
  {
    id: "4",
    contact: {
      id: "c4",
      name: "James Rodriguez",
      email: "j.rodriguez@consulting.com",
      phone: "+1 (555) 456-7890",
      avatar: "JR",
    },
    channel: "whatsapp",
    lastMessage: "Can you send me the updated documents?",
    lastMessageTime: "3 hours ago",
    unreadCount: 1,
    status: "active",
  },
  {
    id: "5",
    contact: {
      id: "c5",
      name: "Lisa Anderson",
      email: "lisa.a@digital.co",
      phone: "+1 (555) 567-8901",
      avatar: "LA",
    },
    channel: "email",
    lastMessage: "Thank you for your help with the project!",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    status: "active",
  },
  {
    id: "6",
    contact: {
      id: "c6",
      name: "David Park",
      email: "david.p@agency.com",
      phone: "+1 (555) 678-9012",
      avatar: "DP",
    },
    channel: "sms",
    lastMessage: "Looking forward to our collaboration!",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    status: "active",
  },
  {
    id: "7",
    contact: {
      id: "c7",
      name: "Rachel Kim",
      email: "rachel.k@solutions.io",
      phone: "+1 (555) 789-0123",
      avatar: "RK",
    },
    channel: "whatsapp",
    lastMessage: "I have a few questions about the pricing.",
    lastMessageTime: "2 days ago",
    unreadCount: 0,
    status: "active",
  },
  {
    id: "8",
    contact: {
      id: "c8",
      name: "Tom Martinez",
      email: "tom.m@enterprise.com",
      phone: "+1 (555) 890-1234",
      avatar: "TM",
    },
    channel: "email",
    lastMessage: "The demo went great! Let's move forward.",
    lastMessageTime: "3 days ago",
    unreadCount: 0,
    status: "active",
  },
];

export const sampleMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "m1",
      conversationId: "1",
      content: "Hi Sarah! Thanks for reaching out. How can I help you today?",
      sender: "user",
      timestamp: "10:30 AM",
      channel: "whatsapp",
      status: "read",
    },
    {
      id: "m2",
      conversationId: "1",
      content:
        "I'm interested in learning more about your unified inbox solution. Can you tell me more about the features?",
      sender: "contact",
      timestamp: "10:32 AM",
      channel: "whatsapp",
      status: "read",
    },
    {
      id: "m3",
      conversationId: "1",
      content:
        "Absolutely! Our platform brings together SMS, WhatsApp, and Email into one interface. You can manage all customer communications in real-time, collaborate with your team, and track analytics.",
      sender: "user",
      timestamp: "10:35 AM",
      channel: "whatsapp",
      status: "read",
    },
    {
      id: "m4",
      conversationId: "1",
      content: "That sounds exactly like what we need! Do you have a trial?",
      sender: "contact",
      timestamp: "10:37 AM",
      channel: "whatsapp",
      status: "read",
    },
    {
      id: "m5",
      conversationId: "1",
      content:
        "Yes! We offer a 14-day free trial with full access to all features. I can set that up for you right now.",
      sender: "user",
      timestamp: "10:38 AM",
      channel: "whatsapp",
      status: "read",
    },
    {
      id: "m6",
      conversationId: "1",
      content: "Thanks for the quick response! I'll check that out.",
      sender: "contact",
      timestamp: "10:40 AM",
      channel: "whatsapp",
      status: "read",
    },
  ],
  "2": [
    {
      id: "m7",
      conversationId: "2",
      content:
        "Hi Michael, I hope this email finds you well. I wanted to follow up on our previous conversation about the integration options.",
      sender: "user",
      timestamp: "9:15 AM",
      channel: "email",
      status: "read",
    },
    {
      id: "m8",
      conversationId: "2",
      content:
        "Hello! Yes, I've reviewed the proposal and it looks promising. I particularly like the analytics dashboard feature.",
      sender: "contact",
      timestamp: "10:20 AM",
      channel: "email",
      status: "read",
    },
    {
      id: "m9",
      conversationId: "2",
      content:
        "Great to hear! The analytics module provides real-time insights into message engagement, response times, and team performance. Would you like a detailed walkthrough?",
      sender: "user",
      timestamp: "10:30 AM",
      channel: "email",
      status: "read",
    },
    {
      id: "m10",
      conversationId: "2",
      content: "Could we schedule a meeting to discuss the proposal?",
      sender: "contact",
      timestamp: "10:45 AM",
      channel: "email",
      status: "delivered",
    },
  ],
  "3": [
    {
      id: "m11",
      conversationId: "3",
      content: "Hi Emma! Quick reminder about tomorrow's meeting.",
      sender: "user",
      timestamp: "Yesterday 4:00 PM",
      channel: "sms",
      status: "read",
    },
    {
      id: "m12",
      conversationId: "3",
      content: "Thanks for the reminder! What time again?",
      sender: "contact",
      timestamp: "Yesterday 4:15 PM",
      channel: "sms",
      status: "read",
    },
    {
      id: "m13",
      conversationId: "3",
      content: "10 AM at our downtown office. Looking forward to it!",
      sender: "user",
      timestamp: "Yesterday 4:16 PM",
      channel: "sms",
      status: "read",
    },
    {
      id: "m14",
      conversationId: "3",
      content: "Perfect! See you tomorrow at 10 AM.",
      sender: "contact",
      timestamp: "Yesterday 4:20 PM",
      channel: "sms",
      status: "read",
    },
  ],
  "4": [
    {
      id: "m15",
      conversationId: "4",
      content: "Good morning James! I hope you had a great weekend.",
      sender: "user",
      timestamp: "8:30 AM",
      channel: "whatsapp",
      status: "read",
    },
    {
      id: "m16",
      conversationId: "4",
      content:
        "Morning! Yes, it was great. Can you send me the updated documents?",
      sender: "contact",
      timestamp: "8:45 AM",
      channel: "whatsapp",
      status: "delivered",
    },
  ],
};

export const sampleAnalytics = {
  totalMessages: 2847,
  messageGrowth: 12.5,
  activeConversations: 156,
  conversationGrowth: 8.3,
  avgResponseTime: "2m 34s",
  responseTimeChange: -15.2,
  satisfactionRate: 94.5,
  satisfactionChange: 2.1,
  channelDistribution: [
    { channel: "WhatsApp", count: 1289, percentage: 45.3 },
    { channel: "Email", count: 968, percentage: 34.0 },
    { channel: "SMS", count: 590, percentage: 20.7 },
  ],
  messagesByDay: [
    { day: "Mon", count: 420 },
    { day: "Tue", count: 385 },
    { day: "Wed", count: 445 },
    { day: "Thu", count: 410 },
    { day: "Fri", count: 395 },
    { day: "Sat", count: 180 },
    { day: "Sun", count: 165 },
  ],
  topContacts: [
    { name: "Sarah Johnson", messages: 87, avatar: "SJ" },
    { name: "Michael Chen", messages: 62, avatar: "MC" },
    { name: "Emma Wilson", messages: 54, avatar: "EW" },
    { name: "James Rodriguez", messages: 48, avatar: "JR" },
    { name: "Lisa Anderson", messages: 41, avatar: "LA" },
  ],
};
