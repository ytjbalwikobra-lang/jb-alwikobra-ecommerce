# WhatsApp Verification System with Dynamic API Management

## 🎯 Overview

This system provides a comprehensive WhatsApp verification solution with database-driven API configuration for the JB Alwikobra e-commerce platform. It supports multiple WhatsApp providers and dynamic API key management.

## 🏗️ Architecture

### Database Schema
- **whatsapp_providers**: Store different WhatsApp API providers (Woo-wa, Fonnte, etc.)
- **whatsapp_api_keys**: Manage multiple API keys per provider with usage tracking
- **whatsapp_message_logs**: Complete message logging with performance metrics

### Dynamic Service Layer
- **DynamicWhatsAppService**: Auto-selects best available API key based on rate limits and usage
- **Provider abstraction**: Supports different API structures and response formats
- **Automatic failover**: Switches between API keys when limits are reached

## 📋 Features

### ✅ Multi-Provider Support
- **Woo-wa (NotifAPI)**: `https://notifapi.com` - Primary provider
- **Fonnte**: Alternative provider
- **Mock API**: For testing and development
- **Extensible**: Easy to add new providers

### ✅ Dynamic API Key Management
- Multiple API keys per provider
- Primary/backup key designation
- Rate limiting tracking (hourly/daily)
- Usage statistics and monitoring
- Automatic key rotation

### ✅ Message Types
- **Verification codes**: 6-digit codes for phone verification
- **Welcome messages**: Rich welcome messages after signup
- **Custom messages**: Flexible message sending
- **Media support**: Images and files (provider dependent)

### ✅ Admin Dashboard API
- View all providers and configurations
- Manage API keys (add/edit/delete)
- Message logs with filtering
- Usage statistics and analytics
- Rate limiting monitoring

## 🚀 API Endpoints

### Authentication Flow
```
POST /api/auth/signup
- Sends WhatsApp verification code
- Creates user with phone + password

POST /api/auth/verify-phone  
- Verifies 6-digit WhatsApp code
- Creates user session

POST /api/auth/complete-profile
- Adds email and name
- Sends welcome message via WhatsApp
```

### Admin Management
```
GET /api/admin/whatsapp-settings?action=providers
- List all WhatsApp providers

GET /api/admin/whatsapp-settings?action=keys  
- List all API keys (masked)

GET /api/admin/whatsapp-settings?action=logs
- Get message logs with filtering

GET /api/admin/whatsapp-settings?action=stats
- Usage statistics and analytics

POST /api/admin/whatsapp-settings
- Add new API key

PUT /api/admin/whatsapp-settings  
- Update API key settings

DELETE /api/admin/whatsapp-settings
- Remove API key
```

## 🔧 Setup Instructions

### 1. Database Setup
```sql
-- Deploy the WhatsApp API settings schema
\i WHATSAPP_API_SETTINGS_SCHEMA.sql
```

### 2. Add API Keys
```javascript
// Via admin API
POST /api/admin/whatsapp-settings
{
  "provider_name": "woo-wa",
  "key_name": "Production Key 1", 
  "api_key": "your-actual-woo-wa-api-key",
  "is_primary": true
}
```

### 3. Environment Variables
```bash
# Woo-wa API Configuration (Production)
REACT_APP_WHATSAPP_API_URL=https://notifapi.com
REACT_APP_WHATSAPP_API_KEY=your-woo-wa-api-key

# Database
REACT_APP_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-key
```

## 📊 Woo-wa API Documentation

### Base URL
```
https://notifapi.com
```

### Send Message Endpoint
```
POST /send_message

Body:
{
  "phone_no": "6281234567999",
  "key": "your-api-key", 
  "message": "Your message"
}

Response:
{
  "status": "sent",
  "id_message": "msg_12345"
}
```

### Other Endpoints
- `POST /async_send_message` - Asynchronous sending
- `POST /send_image_url` - Send image with text
- `POST /send_file_url` - Send file attachment
- `POST /check_number` - Verify WhatsApp number

## 🧪 Testing

### Test Files Created
- `test-dynamic-whatsapp.js` - Complete system test
- `test-whatsapp-verification.js` - Basic verification test  
- `mock-whatsapp-api.js` - Mock server for testing

### Run Tests
```bash
# Test the complete dynamic system
node test-dynamic-whatsapp.js

# Test basic verification 
node test-whatsapp-verification.js

# Start mock server for development
node mock-whatsapp-api.js
```

## 📈 Usage Monitoring

### Message Logs
- All messages logged with response times
- Success/failure tracking
- Context tracking (verification, welcome, etc.)
- Provider performance comparison

### Statistics Available
- Total messages sent
- Success rate percentage  
- Average response times
- Daily/hourly usage counts
- Rate limit utilization

### Admin Dashboard Features
- Real-time message logs
- Provider performance metrics
- API key usage tracking
- Rate limit monitoring
- Error analysis

## 🔐 Security Features

### API Key Management
- Keys stored securely in database
- Masked display in admin panel
- Rate limiting per key
- Automatic key rotation
- Usage monitoring

### Message Logging
- Complete request/response logging
- Error tracking and analysis
- Performance monitoring
- Audit trail for compliance

## 🛠️ Customization

### Adding New Providers
1. Insert provider configuration in `whatsapp_providers` table
2. Update `DynamicWhatsAppService` for any special handling
3. Add API keys via admin panel
4. Test with mock messages

### Custom Message Types
```javascript
// In DynamicWhatsAppService
async sendCustomMessage(phone, message, context) {
  return this.sendMessage({
    phone,
    message,
    contextType: context.type,
    contextId: context.id
  });
}
```

## 📱 Phone Number Format

### Indonesian Format
- Input: `081234567999` or `8123456799`
- Stored: `6281234567999` (with country code)
- Validation: `/^62[0-9]{9,13}$/`

## 🚀 Production Deployment

### 1. Deploy Database Schema
```sql
-- Run in Supabase SQL editor
\i WHATSAPP_API_SETTINGS_SCHEMA.sql
```

### 2. Add Production API Keys
- Get Woo-wa API key from https://woo-wa.com/
- Add via admin panel or directly to database
- Set as primary key

### 3. Environment Setup
- Update Vercel environment variables
- Configure Supabase service key
- Set production WhatsApp API URL

### 4. Testing Checklist
- [ ] Database schema deployed
- [ ] API keys added and active
- [ ] Signup flow working
- [ ] WhatsApp messages sending
- [ ] Admin panel accessible
- [ ] Message logs recording
- [ ] Statistics updating

## 📞 Support

### Troubleshooting
1. **Messages not sending**: Check API key validity and rate limits
2. **Database errors**: Verify schema deployment and permissions
3. **Rate limiting**: Add additional API keys or upgrade plan
4. **Provider issues**: Switch to backup provider

### Monitoring
- Check message logs for errors
- Monitor success rates
- Watch rate limit usage
- Review response times

---

✅ **System Status**: Ready for production with comprehensive WhatsApp verification and dynamic API management!
