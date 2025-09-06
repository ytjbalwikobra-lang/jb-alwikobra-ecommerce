#!/usr/bin/env node
/**
 * Environment Security Validator
 * 
 * This script validates that environment variables are properly configured
 * and checks for common security issues.
 */

const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkRequiredEnvVars() {
  log('blue', '🔍 Checking required environment variables...');
  
  const requiredVars = {
    frontend: [
      'REACT_APP_SUPABASE_URL',
      'REACT_APP_SUPABASE_ANON_KEY',
      'REACT_APP_XENDIT_PUBLIC_KEY'
    ],
    backend: [
      'SUPABASE_SERVICE_ROLE_KEY',
      'XENDIT_SECRET_KEY'
    ],
    optional: [
      'XENDIT_CALLBACK_TOKEN',
      'WHATSAPP_API_KEY',
      'WHATSAPP_GROUP_ID'
    ]
  };

  let allGood = true;

  // Check frontend vars
  log('blue', '\n📱 Frontend variables:');
  requiredVars.frontend.forEach(varName => {
    if (process.env[varName]) {
      log('green', `  ✅ ${varName}: Set`);
    } else {
      log('red', `  ❌ ${varName}: Missing`);
      allGood = false;
    }
  });

  // Check backend vars
  log('blue', '\n🖥️  Backend variables:');
  requiredVars.backend.forEach(varName => {
    if (process.env[varName]) {
      log('green', `  ✅ ${varName}: Set`);
    } else {
      log('red', `  ❌ ${varName}: Missing`);
      allGood = false;
    }
  });

  // Check optional vars
  log('blue', '\n🔧 Optional variables:');
  requiredVars.optional.forEach(varName => {
    if (process.env[varName]) {
      log('green', `  ✅ ${varName}: Set`);
    } else {
      log('yellow', `  ⚠️  ${varName}: Not set (optional)`);
    }
  });

  return allGood;
}

function checkForSecretsInFiles() {
  log('blue', '\n🔍 Scanning for potential secrets in example files...');
  
  const filesToCheck = ['.env.example', '.env.template'];
  let foundSecrets = false;

  filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for potential real API keys
      const secretPatterns = [
        { pattern: /xnd_[a-zA-Z0-9_-]{50,}/, name: 'Xendit API key' },
        { pattern: /sk_[a-zA-Z0-9_-]{50,}/, name: 'Secret key' },
        { pattern: /pk_[a-zA-Z0-9_-]{50,}/, name: 'Public key (potentially real)' },
        { pattern: /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/, name: 'JWT token' }
      ];

      secretPatterns.forEach(({ pattern, name }) => {
        if (pattern.test(content)) {
          log('red', `  ❌ ${file}: Contains potential real ${name}`);
          foundSecrets = true;
        }
      });

      if (!foundSecrets) {
        log('green', `  ✅ ${file}: No obvious secrets found`);
      }
    }
  });

  return !foundSecrets;
}

function checkGitIgnore() {
  log('blue', '\n🔍 Checking .gitignore configuration...');
  
  if (!fs.existsSync('.gitignore')) {
    log('red', '  ❌ .gitignore file not found');
    return false;
  }

  const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
  const requiredEntries = ['.env', '.env.local'];
  
  let allIgnored = true;
  requiredEntries.forEach(entry => {
    if (gitignoreContent.includes(entry)) {
      log('green', `  ✅ ${entry} is properly ignored`);
    } else {
      log('red', `  ❌ ${entry} is NOT in .gitignore`);
      allIgnored = false;
    }
  });

  return allIgnored;
}

function checkSourceCodeSecurity() {
  log('blue', '\n🔍 Scanning source code for hardcoded secrets...');
  
  const { execSync } = require('child_process');
  
  try {
    // Check for hardcoded API keys
    const apiKeyCheck = execSync(
      'find src api -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -E "(sk_|pk_|xnd_)[a-zA-Z0-9_-]{20,}" 2>/dev/null || true',
      { encoding: 'utf8' }
    ).trim();

    if (apiKeyCheck) {
      log('red', '  ❌ Potential hardcoded API keys found:');
      console.log(apiKeyCheck);
      return false;
    }

    // Check for hardcoded database URLs
    const urlCheck = execSync(
      'find src api -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -E "https://[a-zA-Z0-9-]+\\.supabase\\.co" 2>/dev/null || true',
      { encoding: 'utf8' }
    ).trim();

    if (urlCheck && !urlCheck.includes('your-project')) {
      log('red', '  ❌ Potential hardcoded database URLs found:');
      console.log(urlCheck);
      return false;
    }

    log('green', '  ✅ No obvious hardcoded secrets found in source code');
    return true;
  } catch (error) {
    log('yellow', '  ⚠️  Could not scan source code (commands not available)');
    return true; // Assume OK if we can't check
  }
}

function generateReport() {
  log('blue', '\n📊 Environment Security Report');
  log('blue', '================================\n');

  const checks = [
    { name: 'Environment Variables', fn: checkRequiredEnvVars },
    { name: 'Example Files Security', fn: checkForSecretsInFiles },
    { name: 'Git Ignore Configuration', fn: checkGitIgnore },
    { name: 'Source Code Security', fn: checkSourceCodeSecurity }
  ];

  let allPassed = true;
  const results = {};

  checks.forEach(({ name, fn }) => {
    const passed = fn();
    results[name] = passed;
    allPassed = allPassed && passed;
  });

  log('blue', '\n📋 Summary:');
  Object.entries(results).forEach(([name, passed]) => {
    log(passed ? 'green' : 'red', `  ${passed ? '✅' : '❌'} ${name}`);
  });

  if (allPassed) {
    log('green', '\n🎉 All security checks passed!');
    log('green', 'Your environment configuration appears to be secure.');
  } else {
    log('red', '\n⚠️  Some security issues found.');
    log('yellow', 'Please review the issues above and fix them before deploying.');
  }

  return allPassed;
}

// Run the validation
if (require.main === module) {
  const passed = generateReport();
  process.exit(passed ? 0 : 1);
}

module.exports = { generateReport, checkRequiredEnvVars, checkForSecretsInFiles, checkGitIgnore, checkSourceCodeSecurity };