# UniBox Inbound Messaging System

## Overview

This document describes the complete inbound messaging and conversation system implemented for UniBox, a unified multi-channel customer communication platform.

## 🏗️ Architecture

### Core Components

1. **Message Service** (`src/lib/services/message-service.ts`)

   - Centralized message processing
   - Conversation threading logic
   - Contact auto-creation
   - Email synchronization

2. **API Endpoints**

   - `/api/conversations` - Get all conversations
   - `/api/conversations/[id]` - Get/update specific conversation
   - `/api/sync/emails` - Manual email synchronization
   - `/api/webhooks/email` - Email webhook handler
   - `/api/webhooks/twilio` - Twilio webhook handler

3. **React Components**
   - `ConversationList` - Displays threaded conversations
   - `MessageView` - Shows conversation details and messaging
   - `useConversations` - Custom hook for state management

## 📧 Email Integration

### Email API Configuration

The system integrates with the provided email API:

```javascript
const emailAPI = {
  baseURL: "https://mailer.adityacoomar.dev/api",
  apiKey: "CH.dev.LikSVyMhOYvCTl5PrrDjHWfqUZUdg9XX-soMsFNQwZQ",
  endpoints: {
    fetchEmails: "/fetch-emails",
    getEmailContent: "/email/content",
  },
};
```

### Email Sync Process

1. **Fetch Inbox**: Retrieves email list from INBOX folder
2. **Process New Emails**: Checks for emails not yet processed
3. **Get Full Content**: Fetches complete email content including attachments
4. **Create Conversations**: Groups emails by sender into conversations
5. **Store Messages**: Saves messages with proper threading

### Email Sync API Usage

```typescript
// Manual sync
POST /api/sync/emails
{
  "folder": "INBOX"  // Optional, defaults to INBOX
}

// Response
{
  "success": true,
  "data": {
    "totalEmails": 10,
    "processedCount": 3,
    "newConversations": 2
  }
}
```

## 💬 Conversation Threading

### Thread Logic

Conversations are automatically created and threaded based on:

1. **Contact Identification**: Email address, phone number, or WhatsApp number
2. **Channel Consistency**: Same communication channel (EMAIL, SMS, WHATSAPP)
3. **Auto-Merge**: Multiple contact methods are linked to single contact

### Database Schema

```prisma
model Conversation {
  id              String                @id @default(cuid())
  contactId       String
  channel         CommunicationChannel
  status          ConversationStatus    @default(ACTIVE)
  lastMessageAt   DateTime?
  unreadCount     Int                   @default(0)
  messages        Message[]
  contact         Contact               @relation(fields: [contactId], references: [id])
}

model Message {
  id             String            @id @default(cuid())
  conversationId String
  content        String
  direction      MessageDirection
  status         MessageStatus     @default(SENT)
  createdAt      DateTime          @default(now())
  metadata       Json?
  attachments    Attachment[]
}
```

## 🔄 Real-time Updates

### Auto-refresh System

- **Conversation List**: Refreshes every 30 seconds
- **Email Sync**: Manual trigger with progress indicators
- **Message Status**: Real-time status updates
- **Unread Counters**: Automatic badge updates

### Search Functionality

```typescript
// Search conversations
const searchResults = await searchConversations("customer query");

// Search supports:
- Contact names (firstName, lastName)
- Email addresses
- Phone numbers
- Message content
```

## 🎯 Usage Examples

### 1. Basic Email Sync

```javascript
// In your React component
const { syncEmails, conversations, loading } = useConversations();

const handleEmailSync = async () => {
  const result = await syncEmails();
  if (result.success) {
    console.log(`Synced ${result.processedCount} new emails`);
  }
};
```

### 2. Conversation Management

```javascript
// Select and mark conversation as read
const handleSelectConversation = (conversationId) => {
  setSelectedConversation(conversationId);
  markAsRead(conversationId);
};

// Reply to conversation
const handleReply = async (conversationId, content) => {
  const response = await fetch(`/api/conversations/${conversationId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
};
```

### 3. Webhook Processing

```javascript
// Twilio webhook (SMS/WhatsApp)
POST / api / webhooks / twilio;
// Automatically processes inbound SMS/WhatsApp messages

// Email webhook (future implementation)
POST / api / webhooks / email;
// Processes inbound email notifications
```

## 🛠️ API Reference

### GET /api/conversations

Get all conversations with optional filtering.

**Query Parameters:**

- `query` (string): Search term for filtering
- `channel` (string): Filter by communication channel
- `status` (string): Filter by conversation status

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "conv_123",
      "channel": "EMAIL",
      "status": "ACTIVE",
      "unreadCount": 2,
      "lastMessageAt": "2025-11-02T10:30:00Z",
      "contact": {
        "id": "contact_456",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "messages": [...],
      "_count": { "messages": 5 }
    }
  ]
}
```

### GET /api/conversations/[id]

Get specific conversation with messages.

**Query Parameters:**

- `includeMessages` (boolean): Include messages in response

### POST /api/conversations/[id]

Reply to a conversation.

**Body:**

```json
{
  "content": "Your reply message",
  "subject": "Re: Original Subject" // For email replies
}
```

### PATCH /api/conversations/[id]

Update conversation status.

**Body:**

```json
{
  "action": "markAsRead" | "markAsUnread" | "archive"
}
```

### POST /api/sync/emails

Manually synchronize emails from the inbox.

**Body:**

```json
{
  "folder": "INBOX" // Optional
}
```

## 🔧 Configuration

### Environment Variables

```env
# Email API Configuration
EMAIL_API_URL=https://mailer.adityacoomar.dev/api
EMAIL_API_KEY=your-api-key-here

# Twilio Configuration (if used)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_WEBHOOK_SECRET=your-webhook-secret
```

### Email Integration Setup

1. **API Access**: Ensure you have valid API key for the email service
2. **Folder Configuration**: Default is INBOX, but can be configured
3. **Sync Frequency**: Currently manual, but can be automated with cron jobs

## 📱 UI Features

### Conversation List

- **Search**: Real-time search across all conversations
- **Filtering**: By channel, status, unread count
- **Auto-refresh**: Every 30 seconds for new messages
- **Sync Button**: Manual email synchronization
- **Unread Badges**: Visual indicators for unread messages

### Message View

- **Message Threading**: Chronological message display
- **Reply Functionality**: Send replies via same channel
- **Attachment Support**: Display and download attachments
- **Status Indicators**: Message delivery and read status
- **Channel Badges**: Visual channel identification

## 🚀 Deployment

### Prerequisites

1. **Database**: PostgreSQL with Prisma ORM
2. **Authentication**: Better Auth configured
3. **Email API**: Access to the email service
4. **Environment**: Node.js 18+ and Next.js 14+

### Deployment Steps

1. **Database Migration**:

   ```bash
   npx prisma db push
   npx prisma generate
   ```

2. **Environment Setup**:

   ```bash
   cp .env.example .env
   # Fill in your API keys and database URL
   ```

3. **Build and Start**:
   ```bash
   npm run build
   npm run start
   ```

## 🔍 Testing

### Test Email Sync

Use the provided test script:

```bash
node test-email-sync.js
```

### Manual Testing

1. **Login**: Access `/login` and authenticate
2. **Dashboard**: Navigate to `/dashboard`
3. **Sync Emails**: Click the sync button in conversation list
4. **View Messages**: Click on conversations to view message threads
5. **Reply**: Use message input to send replies

## 🔐 Security Considerations

1. **API Key Protection**: Email API key stored securely in environment
2. **Webhook Validation**: Twilio webhook signature validation (optional)
3. **Authentication**: All APIs require valid user session
4. **Data Sanitization**: Input validation on all message content

## 🎯 Future Enhancements

1. **Real-time WebSocket**: Live message updates
2. **Advanced Search**: Full-text search with indexing
3. **Message Templates**: Pre-defined response templates
4. **Automation Rules**: Auto-responders and routing
5. **Analytics**: Conversation metrics and reporting
6. **File Upload**: Support for outbound attachments
7. **Message Scheduling**: Delayed message sending
8. **Team Collaboration**: Shared conversations and notes

## 📞 Support

For technical issues or questions about the inbound messaging system:

1. Check the console logs for error details
2. Verify API key configuration
3. Test database connectivity
4. Review webhook endpoints and authentication

## 📝 Changelog

### Version 1.0.0 (Current)

- ✅ Email integration with external API
- ✅ Conversation threading and management
- ✅ Real-time UI with search functionality
- ✅ Twilio webhook integration (SMS/WhatsApp)
- ✅ Attachment support
- ✅ Message status tracking
- ✅ Auto-refresh and sync capabilities

---

_This documentation covers the complete inbound messaging system. The implementation provides a solid foundation for a unified communication platform with room for extensive future enhancements._
