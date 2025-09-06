# 🔐 Security Policy

## Overview

This document outlines security best practices for the JB Alwikobra E-commerce application, with special focus on API key management and secret protection.

## 🚨 Critical Security Rules

### ⚠️ NEVER COMMIT SECRETS TO VERSION CONTROL

**Absolutely forbidden:**
- Real API keys in any file
- Production credentials
- Database passwords
- Authentication tokens
- Private keys

## 🔑 API Key Management

### Xendit API Key Configuration

#### 1. Environment Setup

**For Development:**
```bash
# Copy the template
cp .env.template .env

# Edit .env and add your real keys:
XENDIT_SECRET_KEY=xnd_development_your_actual_key_here
XENDIT_API_KEY=xnd_development_your_actual_key_here  
REACT_APP_XENDIT_PUBLIC_KEY=xnd_public_development_your_actual_key_here
XENDIT_CALLBACK_TOKEN=your_webhook_callback_token
```

**For Production (Vercel/Server):**
Set environment variables in your hosting platform:
- `XENDIT_SECRET_KEY` - Server-side secret key
- `XENDIT_API_KEY` - Server-side API key (legacy support)
- `REACT_APP_XENDIT_PUBLIC_KEY` - Client-side public key
- `XENDIT_CALLBACK_TOKEN` - Webhook security token

#### 2. Using the Xendit Configuration Helper

```javascript
// ✅ CORRECT: Use the helper
const { getXenditSecretKey, validateXenditConfig } = require('./xendit_config');

try {
  const secretKey = getXenditSecretKey();
  // Use secretKey safely
} catch (error) {
  console.error('Xendit configuration error:', error.message);
}

// ❌ WRONG: Hardcoded keys
const API_KEY = 'xnd_development_abc123'; // Never do this!
```

#### 3. Key Rotation Process

When rotating Xendit API keys:

1. **Generate new keys** in Xendit dashboard
2. **Update environment variables** in all environments:
   - Development: Update `.env` file (never commit)
   - Production: Update hosting platform environment variables
3. **Test the application** with new keys
4. **Revoke old keys** in Xendit dashboard
5. **Verify** no old keys remain in code or configs

### Other API Keys

#### WhatsApp API Key
```bash
REACT_APP_WHATSAPP_API_KEY=your_whatsapp_api_key_here
WHATSAPP_GROUP_ID=your_group_id@g.us
```

#### Supabase Keys
```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anonymous_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Server-side only!
```

## 🛡️ Security Scanning

### Automated Secret Scanning

This repository includes automated secret scanning via GitHub Actions:

- **Gitleaks**: Scans for leaked secrets in commits
- **Custom patterns**: Detects Xendit, Supabase, and other API keys
- **Dependency scanning**: Checks for vulnerable packages

### Enable GitHub Secret Scanning

1. Go to your repository **Settings**
2. Navigate to **Security & analysis**
3. Enable **Secret scanning**
4. Enable **Push protection** to prevent secret commits

### Manual Security Checks

Before committing, run:
```bash
# Check for potential secrets
grep -r "xnd_" . --exclude-dir=.git --exclude-dir=node_modules

# Check for .env files
find . -name ".env" -not -path "./.git/*"

# Validate environment config
node -e "console.log(require('./xendit_config').validateXenditConfig())"
```

## 🚫 What NOT to Commit

### Forbidden Files
- `.env` (actual environment file)
- `.env.local`
- `.env.production`
- `dev-files-backup/` (development backups)
- Any file containing real API keys

### Forbidden Patterns
```javascript
// ❌ NEVER commit these patterns:
const API_KEY = 'xnd_development_abc123';
const SECRET = 'real_secret_value';
const PASSWORD = 'actual_password';

// ✅ ALWAYS use environment variables:
const API_KEY = process.env.XENDIT_SECRET_KEY;
const SECRET = process.env.MY_SECRET;
```

## 📋 Security Checklist

### Before Deployment
- [ ] All API keys are in environment variables
- [ ] No `.env` files committed to repository
- [ ] Secret scanning is enabled
- [ ] Environment variables are set in production
- [ ] All team members understand security policies

### Regular Security Maintenance
- [ ] Rotate API keys quarterly
- [ ] Review and update dependencies monthly
- [ ] Monitor secret scanning alerts
- [ ] Audit environment variable access
- [ ] Review team access permissions

## 🚨 Incident Response

### If API Keys Are Compromised

**Immediate Actions:**
1. **Revoke** the compromised keys immediately
2. **Generate** new keys
3. **Update** all environments with new keys
4. **Review** recent activity for suspicious usage
5. **Notify** team members of the incident

### If Secrets Are Committed to Git

1. **Do NOT** just delete the file in a new commit
2. **Contact** repository administrators immediately
3. **Consider** repository history cleanup (dangerous)
4. **Revoke** any exposed credentials immediately
5. **Update** all affected systems

## 📞 Security Contact

For security concerns or questions:
- Create a private issue in this repository
- Follow responsible disclosure practices
- Include sufficient detail to reproduce issues

## 🔗 Additional Resources

- [Xendit API Documentation](https://developers.xendit.co/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/database/security)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Remember: Security is everyone's responsibility. When in doubt, ask for help rather than risk exposure.**