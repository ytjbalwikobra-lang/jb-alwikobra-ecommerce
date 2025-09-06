# JB Alwikobra E-commerce

A modern e-commerce platform for gaming account sales and rentals, built with React, TypeScript, and Supabase.

## Features

- 🎮 Gaming account marketplace
- 💳 Secure payment processing with Xendit
- 📱 WhatsApp integration for notifications
- 🔐 Multi-layer authentication system
- 📊 Admin dashboard for order management
- 🚀 Real-time updates and notifications

## 🔐 Security & Environment Setup

### Quick Start
```bash
# 1. Clone the repository
git clone <repository-url>
cd jb-alwikobra-ecommerce

# 2. Set up environment variables
cp .env.template .env
# Edit .env with your actual API keys

# 3. Install dependencies
npm install

# 4. Validate security configuration
node scripts/validate-env-security.js

# 5. Start development server
npm start
```

### Environment Configuration

This project uses environment variables for all sensitive configuration. **Never commit real API keys to Git.**

#### Required Environment Variables

**Frontend (Public - exposed to browser):**
```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
REACT_APP_XENDIT_PUBLIC_KEY=xnd_public_development_...
REACT_APP_SITE_NAME=JB Alwikobra
REACT_APP_SITE_URL=https://your-domain.com
```

**Backend (Private - server-side only):**
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
XENDIT_SECRET_KEY=xnd_development_...
XENDIT_CALLBACK_TOKEN=your_callback_token_here
WHATSAPP_API_KEY=your_whatsapp_api_key_here
```

#### Environment Files
- `.env.template` - Safe template with placeholders
- `.env.example` - Example with safe dummy values
- `.env.development.template` - Development-specific template
- `.env.production.template` - Production-specific template
- `.env` - Your actual secrets (git-ignored)

### Security Features

#### Automated Security Scanning
This repository includes GitHub Actions workflows that automatically:
- 🔍 Scan for exposed secrets in code and files
- 🛡️ Check dependencies for vulnerabilities
- 🔐 Validate environment file security
- 📊 Run CodeQL security analysis

#### Environment Security Validation
Run the security validator to check your configuration:
```bash
node scripts/validate-env-security.js
```

This script checks for:
- ✅ Required environment variables are set
- ✅ No real secrets in example files
- ✅ Proper .gitignore configuration
- ✅ No hardcoded secrets in source code

#### Security Best Practices Applied
- 🔒 All API keys stored in environment variables
- 🚫 No hardcoded secrets in source code
- 🛡️ Environment files properly git-ignored
- 📋 Template system for safe onboarding
- 🔍 Automated secret scanning in CI/CD
- ⚡ Graceful error handling for missing keys

### Deployment Security

#### Production Checklist
- [ ] Set environment variables in deployment platform
- [ ] Use production API keys (not development)
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure proper CORS policies
- [ ] Run security validation: `node scripts/validate-env-security.js`
- [ ] Monitor deployment for security alerts

#### Platform-Specific Setup
**Vercel:**
```bash
vercel env add XENDIT_SECRET_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

**Netlify:** Dashboard → Site Settings → Environment Variables

**Railway:** Dashboard → Variables tab

See [SECRET_MANAGEMENT_GUIDELINES.md](./SECRET_MANAGEMENT_GUIDELINES.md) for comprehensive security documentation.

## 📖 Documentation

- [Secret Management Guidelines](./SECRET_MANAGEMENT_GUIDELINES.md) - Comprehensive security documentation
- [Security Performance Fixes](./SECURITY_PERFORMANCE_FIXES.md) - Recent security improvements
- [Final App Review](./FINAL_APP_REVIEW.md) - Complete system status

## 🛠️ Development

### Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Supabase, Node.js API routes
- **Payments:** Xendit payment gateway
- **Notifications:** WhatsApp API integration
- **Deployment:** Vercel

### Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Application pages
├── services/      # API service functions
├── contexts/      # React context providers
├── utils/         # Utility functions
└── types/         # TypeScript type definitions

api/
├── admin/         # Admin API endpoints
├── auth/          # Authentication endpoints
├── xendit/        # Payment processing
└── analytics/     # Analytics endpoints
```

### Security Validation
Always run security checks before committing:
```bash
# Validate environment security
node scripts/validate-env-security.js

# Check for secrets in code
npm run security-check  # (if available)

# Run comprehensive checks
./comprehensive-check.sh
```

## 🚀 Contributing

1. Follow the security guidelines in [SECRET_MANAGEMENT_GUIDELINES.md](./SECRET_MANAGEMENT_GUIDELINES.md)
2. Never commit real API keys or sensitive data
3. Use the provided environment templates
4. Run security validation before submitting PRs
5. All security checks must pass in CI/CD

## 📞 Support

For security-related questions or to report vulnerabilities:
- Review [SECRET_MANAGEMENT_GUIDELINES.md](./SECRET_MANAGEMENT_GUIDELINES.md)
- Create a GitHub issue for general questions
- Contact the development team directly for sensitive security issues

---

**⚠️ Security Notice:** This application handles payment data and user information. Always follow security best practices and keep dependencies updated.
