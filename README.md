# UniBox - Unified Multi-Channel Communication Platform

A comprehensive unified communication platform built with Next.js 14 that aggregates messages from SMS (Twilio), WhatsApp (Twilio API), and email into a single inbox for seamless multi-channel customer outreach.

## 🚀 Features

### Core Functionality

- **Unified Inbox**: Single interface for SMS, WhatsApp, and Email communications
- **Multi-Channel Messaging**: Send and receive messages across all integrated channels
- **Real-time Updates**: Live message updates and notifications
- **Contact Management**: Centralized contact database with history and notes
- **Team Collaboration**: Multi-user support with role-based access control
- **Analytics Dashboard**: Comprehensive metrics and reporting

### Channel Integrations

- **SMS/MMS**: Twilio SMS API integration
- **WhatsApp**: Twilio WhatsApp Business API
- **Email**: Custom email server integration
- **Webhooks**: Real-time message delivery via webhooks

### User Experience

- **Dark Theme**: Modern dark UI with shadcn/ui components
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Search & Filters**: Advanced conversation and message search
- **Message Scheduling**: Schedule messages for future delivery
- **File Attachments**: Support for media and document sharing

## 🏗️ Tech Stack

### Frontend & Backend

- **Framework**: Next.js 14 (App Router, TypeScript)
- **UI Components**: shadcn/ui with Tailwind CSS
- **Authentication**: Better Auth with email/password and Google OAuth
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: React Query for optimistic updates

### Integrations

- **Twilio SDK**: SMS/WhatsApp messaging
- **Custom Email API**: Flexible email server integration
- **Webhook Support**: Secure webhook validation and processing

### Development

- **TypeScript**: Full type safety
- **ESLint/Prettier**: Code quality and formatting
- **Git**: Version control with branch management

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- Twilio account with SMS and WhatsApp enabled numbers
- Custom email server (or email service API)

## 🛠️ Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/your-username/unibox.git
cd unibox
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/unibox"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# Twilio Configuration
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="your-twilio-phone-number"
TWILIO_WHATSAPP_NUMBER="whatsapp:your-whatsapp-number"

# Email Server Configuration
EMAIL_SERVER_API_ENDPOINT="https://your-email-server.com/api"
EMAIL_SERVER_API_KEY="your-email-server-api-key"
EMAIL_WEBHOOK_SECRET="your-email-webhook-secret"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Optional: Seed database with sample data
npx prisma db seed
```

### 5. Configure Twilio Webhooks

Set up webhooks in your Twilio Console:

- **SMS Webhook URL**: `https://yourdomain.com/api/webhooks/twilio`
- **WhatsApp Webhook URL**: `https://yourdomain.com/api/webhooks/twilio`

### 6. Configure Email Server Webhooks

Set up webhook in your email server to POST to:

- **Email Webhook URL**: `https://yourdomain.com/api/webhooks/email`

### 7. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 🏛️ Architecture Overview

### Database Schema

The application uses a normalized PostgreSQL schema with the following key entities:

- **User**: Authentication and user management
- **Contact**: Customer contact information
- **Conversation**: Channel-specific conversation threads
- **Message**: Individual messages with metadata
- **Integration**: Channel configuration and credentials
- **MessageTemplate**: Reusable message templates
- **ScheduledMessage**: Future message scheduling
- **ContactNote**: Team collaboration notes
- **DailyMetrics**: Analytics and reporting data

### API Structure

```
/api/
├── auth/[...all]           # Better Auth endpoints
├── webhooks/
│   ├── twilio/            # Twilio SMS/WhatsApp webhooks
│   └── email/             # Email server webhooks
├── messages/              # Message sending API
├── conversations/         # Conversation management
└── analytics/            # Analytics and metrics
```

### Component Architecture

```
src/
├── app/                  # Next.js App Router
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── dashboard/       # Main dashboard components
│   └── analytics/       # Analytics components
├── lib/
│   ├── integrations/    # Channel integrations
│   ├── services/        # Business logic
│   └── auth.ts          # Authentication config
└── prisma/
    └── schema.prisma    # Database schema
```

## 📊 Channel Integration Comparison

| Channel  | Latency | Cost        | Reliability | Features                  |
| -------- | ------- | ----------- | ----------- | ------------------------- |
| SMS      | ~1-5s   | $0.0075/msg | 99.9%       | Text only, global reach   |
| WhatsApp | ~1-3s   | $0.005/msg  | 99.5%       | Rich media, read receipts |
| Email    | ~5-30s  | $0.001/msg  | 99.7%       | Rich content, attachments |

### Key Integration Decisions

1. **Twilio for SMS/WhatsApp**: Industry-leading reliability and global coverage
2. **Custom Email Server**: Flexibility for enterprise requirements and cost optimization
3. **Unified Message Model**: Consistent data structure across all channels
4. **Webhook Architecture**: Real-time message processing with retry logic
5. **Channel-Specific Metadata**: Preserve channel features while maintaining unified interface

## 🔒 Security Considerations

- **Environment Variables**: All secrets stored in environment variables
- **Webhook Validation**: Signature verification for all incoming webhooks
- **Database Security**: Parameterized queries and connection encryption
- **Authentication**: Secure session management with Better Auth
- **Rate Limiting**: API rate limiting to prevent abuse

## 📈 Analytics & Monitoring

The platform includes comprehensive analytics:

- **Message Volume**: Track messages by channel and time period
- **Response Times**: Monitor team performance metrics
- **Channel Performance**: Compare engagement across channels
- **Conversion Tracking**: Follow customer journey through conversations
- **Team Metrics**: Individual agent performance tracking

## 🚀 Deployment

### Production Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker Deployment

```bash
# Build image
docker build -t unibox .

# Run container
docker run -p 3000:3000 --env-file .env unibox
```

### Environment Setup

Ensure production environment variables are configured:

- Database connection with SSL
- Twilio production credentials
- Email server production endpoints
- Domain-specific webhook URLs

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Test Coverage

The application includes:

- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Webhook simulation tests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use conventional commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation in `/docs`
- Review the integration guides for specific channels

## 🗺️ Roadmap

### Upcoming Features

- [ ] Voice call integration
- [ ] Advanced message templates
- [ ] Chatbot integration
- [ ] Advanced analytics dashboards
- [ ] Mobile app (React Native)
- [ ] API rate limiting and quotas
- [ ] Advanced team collaboration features
- [ ] Integration marketplace

### Long-term Goals

- Social media channel integrations (Twitter, Facebook Messenger)
- AI-powered message suggestions
- Advanced workflow automation
- Enterprise SSO integration
- Multi-tenant architecture

---

**UniBox** - Unifying customer communication across all channels 🚀
