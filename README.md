# UniBox - Unified Multi-Channel Communication Platform

A comprehensive customer outreach platform built with Next.js 14+ that unifies SMS, WhatsApp, and Email communication channels into a single inbox.

## 🚀 Features

### Contact Management

- ✅ **CRUD Operations**: Create, read, update, and delete contacts
- ✅ **Multi-Channel Support**: Phone, WhatsApp, Email contact information
- ✅ **Tagging System**: Organize contacts with custom tags
- ✅ **Search & Filter**: Find contacts by name, email, phone, or tags
- ✅ **Rich UI**: Modern contact cards with avatars and quick actions

### Multi-Channel Messaging

- ✅ **SMS Integration**: Twilio SMS API for text messaging
- ✅ **WhatsApp Integration**: Twilio WhatsApp API for business messaging
- ✅ **Email Integration**: Custom Email API for professional email communication
- ✅ **Message Scheduling**: Schedule messages for later delivery
- ✅ **Channel Detection**: Automatically detect available channels per contact

### Authentication & Security

- ✅ **Better Auth Integration**: Secure user authentication
- ✅ **Role-Based Access**: User session management
- ✅ **Protected Routes**: Middleware for route protection

### Database & API

- ✅ **Prisma ORM**: Type-safe database operations
- ✅ **PostgreSQL**: Robust data storage
- ✅ **RESTful APIs**: Clean API endpoints for all operations
- ✅ **Type Safety**: Full TypeScript implementation

## 🛠️ Tech Stack

### Frontend/Backend

- **Next.js 14+** - App Router, TypeScript
- **React 19** - Latest React features
- **Tailwind CSS 4** - Modern styling

### Database & ORM

- **PostgreSQL** - Primary database
- **Prisma** - Database ORM and migrations

### Authentication

- **Better Auth** - Authentication system with session management

### Integrations

- **Twilio SDK** - SMS/WhatsApp messaging
- **Custom Email API** - Professional email delivery service
- **React Query** - Data fetching and caching

### UI Components

- **Radix UI** - Headless component primitives
- **Lucide React** - Modern icons
- **React Hot Toast** - Notification system

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- Twilio account with phone number
- Custom email API access

## 🔧 Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/unibox.git
cd unibox
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/unibox"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# Twilio Configuration
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"

# Custom Email Service Configuration
CUSTOM_EMAIL_API_KEY="your-custom-email-api-key"
CUSTOM_EMAIL_API_URL="https://your-email-api-endpoint.com/api/send-mail"
CUSTOM_EMAIL_SENDER_NAME="Your Email Service Name"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed database
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📊 Database Schema

### Core Tables

#### Users

- Authentication and user management
- Integration with Better Auth

#### Contacts

- Contact information storage
- Multi-channel communication details
- Tagging and categorization

#### Conversations

- Channel-specific conversation threads
- Links contacts to message history

#### Messages

- Unified message storage across all channels
- Message status tracking (sent, delivered, failed)
- Scheduling support

#### Message Attachments

- File attachment metadata
- Support for images, documents, etc.

## 🔌 API Endpoints

### Contact Management

```
GET    /api/contacts          # List all contacts
POST   /api/contacts          # Create new contact
GET    /api/contacts/[id]     # Get contact by ID
PUT    /api/contacts/[id]     # Update contact
DELETE /api/contacts/[id]     # Delete contact
```

### Messaging

```
POST   /api/messages/send     # Send message (SMS/WhatsApp/Email)
```

### Webhooks

```
POST   /api/webhooks/twilio   # Twilio webhook for incoming messages
POST   /api/webhooks/email    # Email webhook for incoming messages
```

### Authentication

```
POST   /api/auth/login        # User login
POST   /api/auth/register     # User registration
POST   /api/auth/logout       # User logout
```

## 🎯 Usage Examples

### Creating a Contact

```typescript
const contact = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "+1234567890",
  whatsappNumber: "+1234567890",
  tags: ["customer", "vip"],
};

const response = await fetch("/api/contacts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(contact),
});
```

### Sending a Message

```typescript
const message = {
  contactId: "contact-id",
  content: "Hello! How can we help you today?",
  channel: "SMS", // or "WHATSAPP", "EMAIL"
  scheduledFor: "2024-01-01T12:00:00Z", // optional
};

const response = await fetch("/api/messages/send", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(message),
});
```

## 📱 Channel Integration Details

### SMS via Twilio

- Direct SMS messaging to phone numbers
- Delivery status tracking
- International number support
- Trial account limitations apply

### WhatsApp via Twilio

- WhatsApp Business API integration
- Rich media support (images, documents)
- Sandbox mode for development
- Production approval required for live messages

### Email via Custom API

- Professional email delivery service
- HTML content support with automatic plain text conversion
- Multiple recipient support
- Secure API key authentication
- Custom sender name configuration

## 🔐 Security Features

### Authentication

- Secure session management
- Route-level protection
- User role verification

### Data Protection

- Input validation with Zod schemas
- SQL injection prevention via Prisma
- XSS protection with Next.js

### API Security

- Request validation
- Error handling without data leakage
- Rate limiting considerations

## 🎨 UI/UX Features

### Modern Design

- Dark theme optimized interface
- Responsive design for all devices
- Consistent component library

### User Experience

- Real-time form validation
- Loading states and error handling
- Intuitive navigation and workflows
- Toast notifications for user feedback

### Accessibility

- ARIA labels for screen readers
- Keyboard navigation support
- High contrast design elements

## 🚦 Development Workflow

### Code Quality

- TypeScript for type safety
- ESLint for code consistency
- Prettier for code formatting

### Testing Strategy

- Component testing with React Testing Library
- API endpoint testing
- Integration testing for workflows

### Deployment

- Vercel deployment ready
- Environment variable management
- Production optimizations

## 📈 Performance Optimizations

### Frontend

- React Query for efficient data fetching
- Component lazy loading
- Image optimization with Next.js

### Backend

- Database query optimization
- API response caching
- Connection pooling

### Monitoring

- Error tracking integration ready
- Performance monitoring setup
- User analytics preparation

## 🔄 Integration Comparison

| Channel  | Latency | Cost     | Reliability | Rich Media |
| -------- | ------- | -------- | ----------- | ---------- |
| SMS      | ~1-5s   | Low      | Very High   | Limited    |
| WhatsApp | ~1-3s   | Medium   | High        | Excellent  |
| Email    | ~5-30s  | Very Low | High        | Excellent  |

## 🗓️ Roadmap

### Phase 1 (Current)

- ✅ Contact management system
- ✅ Multi-channel messaging (SMS, WhatsApp, Email)
- ✅ Basic scheduling functionality

### Phase 2 (Planned)

- [ ] Real-time chat interface
- [ ] Message templates and automation
- [ ] Analytics and reporting dashboard
- [ ] Team collaboration features

### Phase 3 (Future)

- [ ] Social media integrations (Twitter, Facebook)
- [ ] AI-powered message suggestions
- [ ] Advanced workflow automation
- [ ] Mobile application

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation and examples
- Review the API endpoint documentation

---

Built with ❤️ using Next.js, Prisma, and modern web technologies.
