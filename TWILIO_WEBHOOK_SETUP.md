# Twilio Webhook Configuration Guide

This guide provides step-by-step instructions for configuring Twilio webhook URLs for SMS and WhatsApp to enable inbound message tracking and storage.

## Prerequisites

1. **Twilio Account**: Active Twilio account with SMS and WhatsApp services enabled
2. **Phone Numbers**: Twilio phone number(s) configured for SMS and WhatsApp
3. **Domain**: Public domain where your application is deployed (required for webhooks)
4. **Environment Variables**: Ensure the following are set in your `.env` file:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   TWILIO_WHATSAPP_NUMBER=your_whatsapp_number
   ```

## Webhook URL

Your webhook endpoint is available at:

```
https://your-domain.com/api/webhooks/twilio
```

**Important**: Replace `your-domain.com` with your actual deployed domain name.

## Configuration Steps

### 1. SMS Webhook Configuration

1. **Login to Twilio Console**: Go to https://console.twilio.com
2. **Navigate to Phone Numbers**: Go to Phone Numbers > Manage > Active numbers
3. **Select Your SMS Number**: Click on the phone number you want to configure
4. **Configure Messaging Webhook**:
   - In the "Messaging" section, find "A message comes in"
   - Set **Webhook URL**: `https://your-domain.com/api/webhooks/twilio`
   - Set **HTTP Method**: `POST`
   - Leave **Content Type** as default (application/x-www-form-urlencoded)
5. **Save Configuration**: Click "Save"

### 2. WhatsApp Webhook Configuration

#### Option A: Using WhatsApp Sandbox (Development)

1. **Navigate to WhatsApp Sandbox**: Go to Messaging > Try it out > Send a WhatsApp message
2. **Configure Sandbox Webhook**:
   - Set **Webhook URL**: `https://your-domain.com/api/webhooks/twilio`
   - Set **HTTP Method**: `POST`
3. **Save Configuration**

#### Option B: Production WhatsApp Number

1. **Navigate to Phone Numbers**: Go to Phone Numbers > Manage > Active numbers
2. **Select Your WhatsApp Number**: Click on the WhatsApp-enabled number
3. **Configure WhatsApp Webhook**:
   - In the "WhatsApp" section, find "A message comes in"
   - Set **Webhook URL**: `https://your-domain.com/api/webhooks/twilio`
   - Set **HTTP Method**: `POST`
4. **Save Configuration**

### 3. Messaging Service Configuration (Optional but Recommended)

For better organization and management:

1. **Create Messaging Service**: Go to Messaging > Services > Create Messaging Service
2. **Add Phone Numbers**: Add your SMS and WhatsApp numbers to the service
3. **Configure Webhook**:
   - In the "Integration" tab, set:
   - **Incoming Message Webhook URL**: `https://your-domain.com/api/webhooks/twilio`
   - **HTTP Method**: `POST`
4. **Save Configuration**

## Webhook Features

### Supported Message Types

- ✅ SMS messages
- ✅ WhatsApp text messages
- ✅ WhatsApp media messages (images, documents, audio, video)
- ✅ WhatsApp location messages
- ✅ WhatsApp forwarded messages
- ✅ WhatsApp reply messages

### Captured Data

The webhook captures and stores:

- **Basic Message Data**: Content, sender, recipient, timestamp
- **Media Attachments**: All media files with proper metadata
- **Geographic Data**: Location information when available
- **WhatsApp Metadata**: Profile name, forwarding status, reply context
- **Advertisement Data**: Click-to-WhatsApp advertisement information

### Security Features

- **Signature Validation**: Webhook signature verification (enabled in production)
- **Request Validation**: Proper request format validation
- **Error Handling**: Graceful error handling to prevent webhook failures

## Testing the Configuration

### 1. Test SMS

1. Send an SMS to your Twilio phone number from any mobile device
2. Check your application logs for successful processing
3. Verify the message appears in your conversations dashboard

### 2. Test WhatsApp

1. **Sandbox**: Send "join [sandbox-keyword]" to your sandbox number
2. **Production**: Send a message to your WhatsApp Business number
3. Check logs and dashboard for the incoming message

### 3. Test Media Messages

1. Send an image or document via WhatsApp
2. Verify media is properly captured and stored

## Troubleshooting

### Common Issues

#### 1. Webhook Not Receiving Messages

- **Check URL**: Ensure webhook URL is publicly accessible
- **Verify HTTPS**: Webhook URL must use HTTPS in production
- **Check Logs**: Look for webhook errors in your application logs

#### 2. Invalid Signature Errors

- **Auth Token**: Verify `TWILIO_AUTH_TOKEN` is correct
- **URL Match**: Ensure webhook URL in Twilio matches exactly
- **Production Only**: Signature validation is disabled in development

#### 3. Database Connection Issues

- **Database URL**: Verify `DATABASE_URL` is correct
- **Prisma Setup**: Ensure database is properly migrated
- **Connection Pool**: Check database connection limits

### Debugging Steps

1. **Enable Detailed Logging**:

   ```javascript
   // Add to your webhook handler
   console.log("Webhook received:", params);
   ```

2. **Test Webhook Manually**:

   ```bash
   curl -X POST https://your-domain.com/api/webhooks/twilio \
     -d "MessageSid=SMXXXXXXXXXXXXXXXX" \
     -d "From=+1234567890" \
     -d "To=+1987654321" \
     -d "Body=Test message"
   ```

3. **Check Twilio Logs**:
   - Go to Monitor > Logs > Messaging in Twilio Console
   - Look for webhook delivery attempts and responses

## Status Callbacks (Optional)

For tracking message delivery status:

1. **Configure Status Callback**: In your Messaging Service or individual number config
2. **Set Status Callback URL**: `https://your-domain.com/api/webhooks/twilio/status`
3. **Select Events**: Choose which status changes to track (sent, delivered, read, failed)

## Security Best Practices

1. **Enable Signature Validation**: Uncomment signature validation in production
2. **Use HTTPS**: Always use HTTPS for webhook URLs
3. **Restrict Access**: Consider IP whitelisting if possible
4. **Monitor Logs**: Regularly check webhook logs for suspicious activity
5. **Rate Limiting**: Implement rate limiting to prevent abuse

## Environment Variables Reference

Add these to your `.env` file:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/unibox"

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Webhook Response Format

The webhook returns TwiML responses:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>
```

This empty response means:

- Message received and processed successfully
- No automatic reply sent to the user
- Twilio will not retry the webhook

## Monitoring and Analytics

The webhook automatically updates daily metrics for:

- Messages received per channel (SMS/WhatsApp)
- Response rates and times
- Error rates and failed deliveries

Check your analytics dashboard to monitor webhook performance and message volume.

## Support

If you encounter issues:

1. **Check Application Logs**: Look for detailed error messages
2. **Verify Configuration**: Double-check all webhook URLs and credentials
3. **Test Connectivity**: Ensure your webhook endpoint is reachable
4. **Twilio Support**: Contact Twilio support for platform-specific issues

## Next Steps

After configuring webhooks:

1. **Test Thoroughly**: Send various message types to verify functionality
2. **Monitor Performance**: Watch logs and metrics for any issues
3. **Configure Automation**: Set up automated responses or workflows
4. **Scale Considerations**: Monitor webhook performance under load

Your Twilio webhooks are now configured to automatically capture and store all inbound SMS and WhatsApp messages!
