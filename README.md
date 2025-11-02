# UniBox - Unified Multi-Channel Communication Platform

UniBox is a comprehensive customer engagement platform that centralizes communication across SMS, WhatsApp, Email, and other channels into a single unified inbox. Built with Next.js 14+, TypeScript, and Prisma ORM.

## 🚀 Features

### ✅ Core Functionality

- **Unified Inbox**: Kanban-style interface aggregating messages from all channels
- **Multi-Channel Messaging**: SMS, WhatsApp, Email with real-time delivery
- **Contact Management**: Centralized contact profiles with communication history
- **Message Scheduling**: Schedule messages across all channels with background processing
- **Team Collaboration**: Internal notes with @mentions, public/private visibility
- **File Attachments**: Support for email attachments (images, PDFs, documents)
- **Analytics Dashboard**: Response times, channel volume, engagement metrics
- **Real-time Updates**: Live message status and delivery confirmations

### 🔧 Technical Implementation

- **Authentication**: Better Auth with role-based access (Admin/Editor/Viewer)
- **Database**: PostgreSQL with Prisma ORM for type-safe queries
- **Integrations**: Twilio (SMS/WhatsApp), Resend (Email), extensible architecture
- **UI/UX**: Tailwind CSS, Radix UI components, responsive design
- **Background Jobs**: Scheduled message processing via API endpoints
- **File Storage**: Multipart form handling for attachments
- **Type Safety**: Full TypeScript coverage with Zod validation

## 📋 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Twilio Account (for SMS/WhatsApp)
- Resend Account (for Email)

### Installation

1. **Clone and Install**

   ```bash
   git clone https://github.com/your-org/unibox.git
   cd unibox
   npm install
   ```

2. **Environment Setup**

   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

3. **Database Setup**

   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed # Optional: seed with sample data
   ```

4. **Start Development**

   ```bash
   npm run dev
   ```

5. **Access Application**
   - Open http://localhost:3000
   - Sign up for a new account or use demo credentials

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/unibox"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Twilio Integration
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="+1234567890"
TWILIO_WHATSAPP_NUMBER="whatsapp:+1234567890"

# Email Integration
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="noreply@yourdomain.com"

# Scheduled Messages
CRON_SECRET="your-cron-secret-for-background-jobs"
```

## 📊 Integration Comparison Table

| Channel        | Latency | Cost         | Reliability | Character Limit | Media Support | Two-Way | API Quality |
| -------------- | ------- | ------------ | ----------- | --------------- | ------------- | ------- | ----------- |
| **SMS**        | ~1-3s   | $0.0075/msg  | 99.9%       | 160 chars       | ❌            | ✅      | ⭐⭐⭐⭐⭐  |
| **WhatsApp**   | ~1-2s   | $0.005/msg   | 99.5%       | 4096 chars      | ✅            | ✅      | ⭐⭐⭐⭐⭐  |
| **Email**      | ~2-10s  | $0.001/email | 99.8%       | Unlimited       | ✅            | ✅      | ⭐⭐⭐⭐    |
| **Twitter DM** | ~3-5s   | Free         | 95%         | 10,000 chars    | ✅            | ✅      | ⭐⭐⭐      |
| **Facebook**   | ~2-4s   | Free         | 97%         | 2000 chars      | ✅            | ✅      | ⭐⭐⭐      |

### Integration Notes:

- **SMS**: Best for urgent notifications, high open rates (98%), works on all phones
- **WhatsApp**: Excellent for rich media, popular globally, business-friendly
- **Email**: Cost-effective for detailed communications, supports formatting
- **Social Media**: Good for customer service, limited by platform policies

## 🏗 Architecture Overview

### Database Schema (Prisma)

```prisma
model User {
  id       String   @id @default(cuid())
  email    String   @unique
  name     String
  role     UserRole @default(EDITOR)
  // ... auth fields
}

model Contact {
  id              String  @id @default(cuid())
  firstName       String?
  lastName        String?
  email           String?
  phone           String?
  whatsappNumber  String?
  tags            String[]
  conversations   Conversation[]
  notes           Note[]
}

model Conversation {
  id            String    @id @default(cuid())
  contactId     String
  channel       CommunicationChannel
  status        ConversationStatus
  messages      Message[]
  lastMessageAt DateTime?
}

model Message {
  id           String        @id @default(cuid())
  content      String
  channel      CommunicationChannel
  direction    MessageDirection
  status       MessageStatus
  scheduledFor DateTime?     // For scheduled messages
  deliveredAt  DateTime?
  attachments  Attachment[]
}

model Note {
  id        String   @id @default(cuid())
  contactId String
  authorId  String
  content   String
  isPrivate Boolean  @default(false)
  mentions  String[] // User IDs mentioned with @
}
```

### API Architecture

```
/api/
├── auth/[...all]/          # Better Auth handlers
├── contacts/               # Contact CRUD operations
├── conversations/          # Conversation management
├── messages/
│   └── send/              # Multi-channel message sending
├── notes/                 # Team collaboration notes
├── scheduled-messages/
│   └── process/           # Background job processor
├── sync/
│   └── emails/           # Email sync (IMAP polling)
└── webhooks/
    ├── twilio/           # SMS/WhatsApp inbound
    └── email/            # Email webhooks
```

### Component Structure

```
src/components/
├── ui/                   # Reusable UI components
├── dashboard/            # Main inbox interface
├── messaging/            # Message composition & sending
├── contacts/             # Contact management & notes
└── analytics/            # Dashboard & reporting
```

## 🔑 Key Architecture Decisions

### 1. **Database Design**

- **Normalized Schema**: Separate tables for contacts, conversations, messages
- **Flexible Metadata**: JSON fields for channel-specific data
- **Audit Trail**: CreatedAt/UpdatedAt on all entities
- **Soft Deletes**: Retain message history for compliance

### 2. **Message Scheduling**

- **Database-Only**: Simple PostgreSQL-based scheduling (no Redis/Queue needed)
- **API Endpoint**: `/api/scheduled-messages/process` for cron job execution
- **Idempotent**: Safe to run multiple times, handles failures gracefully
- **Scalable**: Batch processing (50 messages per run) for performance

### 3. **File Attachment Strategy**

- **Form Handling**: Multipart form data for email attachments
- **Size Limits**: 5MB per attachment, configurable
- **Security**: File type validation, virus scanning ready
- **Storage**: Local filesystem (easily extensible to S3/CloudFlare)

### 4. **Team Collaboration**

- **Note Privacy**: Public team notes vs private personal notes
- **@Mentions**: Real-time parsing and user lookup
- **Permissions**: Role-based access (Admin sees all, others see public + own)
- **Audit Trail**: Full editing history with timestamps

### 5. **Integration Orchestration**

- **Factory Pattern**: `createSender(channel)` for consistent API
- **Error Handling**: Graceful degradation, retry logic
- **Webhook Security**: HMAC signature verification
- **Rate Limiting**: Respect API limits, implement backoff

### 6. **Performance Optimizations**

- **React Query**: Optimistic updates, background refresh
- **Database Indexing**: Composite indexes on frequently queried fields
- **Pagination**: Cursor-based for conversations, offset for contacts
- **Lazy Loading**: Tab-based loading in contact details

## 🔧 Scheduled Message Processing

### Setup Cron Job

For production deployment, set up a cron job to process scheduled messages:

```bash
# Add to crontab (runs every minute)
* * * * * curl -H "Authorization: Bearer YOUR_CRON_SECRET" -X POST https://yourdomain.com/api/scheduled-messages/process
```

### Monitoring

Check processor status:

```bash
curl https://yourdomain.com/api/scheduled-messages/process
```

Response includes:

- Pending message count
- Future scheduled messages
- Recent processing history
- System health status

## 🚀 Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Webhook endpoints configured
- [ ] Cron job for scheduled messages
- [ ] File upload permissions
- [ ] SSL certificates
- [ ] Rate limiting (Nginx/CloudFlare)
- [ ] Monitoring & logging

### Recommended Stack

- **Hosting**: Vercel, Railway, or DigitalOcean App Platform
- **Database**: Supabase, PlanetScale, or managed PostgreSQL
- **File Storage**: AWS S3, CloudFlare R2, or DigitalOcean Spaces
- **Monitoring**: LogRocket, Sentry, or Datadog
- **Analytics**: PostHog, Mixpanel, or Google Analytics

## 📈 Usage Examples

### Scheduling a Follow-up Message

```typescript
// Using the UI scheduling feature
const messageData = {
  contactId: "contact_123",
  content: "Hi! Following up on our conversation yesterday.",
  channel: "SMS",
  scheduledFor: "2024-01-15T09:00:00Z", // 9 AM next day
};

await fetch("/api/messages/send", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(messageData),
});
```

### Adding Team Notes with Mentions

```typescript
const noteData = {
  contactId: "contact_123",
  content:
    "Customer interested in premium plan. @sarah please follow up with pricing details.",
  isPrivate: false, // Team-visible note
};

await fetch("/api/notes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(noteData),
});
```

### Bulk Email with Attachments

```typescript
const formData = new FormData();
formData.append("contactId", "contact_123");
formData.append("channel", "EMAIL");
formData.append("subject", "Product Catalog 2024");
formData.append("content", "Please find attached our latest catalog...");
formData.append("attachments", fileBlob);

await fetch("/api/messages/send", {
  method: "POST",
  body: formData,
});
```

## 🔍 Testing Guide

### Manual Testing Checklist

1. **Authentication Flow**

   - [ ] Sign up new account
   - [ ] Login/logout functionality
   - [ ] Role-based access control

2. **Contact Management**

   - [ ] Create contact with all fields
   - [ ] Edit contact information
   - [ ] Add/remove tags
   - [ ] Search contacts

3. **Messaging Features**

   - [ ] Send SMS (immediate)
   - [ ] Send WhatsApp (immediate)
   - [ ] Send Email (immediate)
   - [ ] Schedule message for future
   - [ ] Attach file to email

4. **Team Collaboration**

   - [ ] Add public note
   - [ ] Add private note
   - [ ] Edit/delete notes
   - [ ] @mention functionality

5. **Background Processing**
   - [ ] Verify scheduled messages are sent
   - [ ] Check processor API status
   - [ ] Validate error handling

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use Prisma for all database operations
- Implement proper error handling
- Add JSDoc comments for complex functions
- Test API endpoints with sample data

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Twilio**: Reliable SMS/WhatsApp infrastructure
- **Resend**: Modern email delivery platform
- **Radix UI**: Accessible component primitives
- **Prisma**: Type-safe database toolkit
- **Next.js**: Full-stack React framework

---

**Built with ❤️ for modern customer engagement**

For questions or support, please open an issue or contact the maintainers.
