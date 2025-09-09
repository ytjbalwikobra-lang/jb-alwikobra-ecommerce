#!/usr/bin/env node

/**
 * Security validation test script
 * Tests the security measures implemented in the repository
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Running security validation tests...\n');

let passed = 0;
let failed = 0;

function test(description, testFn) {
  try {
    const result = testFn();
    if (result) {
      console.log(`✅ ${description}`);
      passed++;
    } else {
      console.log(`❌ ${description}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${description} - Error: ${error.message}`);
    failed++;
  }
}

// Test 1: Check if .env.example doesn't contain real API keys
test('No real API keys in .env.example', () => {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  return !envExample.includes('xnd_public_production_') && 
         !envExample.includes('f104a4c19ea118dd464e9de20605c4e5');
});

// Test 2: Check if gitignore contains proper patterns
test('.gitignore contains security patterns', () => {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  return gitignore.includes('dev-files-backup/') &&
         gitignore.includes('*.env') &&
         gitignore.includes('.env.*');
});

// Test 3: Check if helper function exists and works
test('Xendit config helper exists and validates', () => {
  const config = require('./xendit_config');
  const validation = config.validateXenditConfig();
  return validation && typeof validation.isValid === 'boolean';
});

// Test 4: Check if SECURITY.md exists
test('SECURITY.md documentation exists', () => {
  return fs.existsSync('SECURITY.md');
});

// Test 5: Check if GitHub Actions workflow exists
test('Secret scanning workflow exists', () => {
  return fs.existsSync('.github/workflows/secret-scan.yml');
});

// Test 6: Check if gitleaks config exists
test('Gitleaks configuration exists', () => {
  return fs.existsSync('.gitleaks.toml');
});

// Test 7: Check if API files use secure patterns
test('API files use environment variables', () => {
  const createInvoice = fs.readFileSync('api/xendit/create-invoice.ts', 'utf8');
  return createInvoice.includes('getXenditSecretKey') &&
         !createInvoice.includes('const XENDIT_SECRET_KEY = \'');
});

console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('🎉 All security tests passed!');
  process.exit(0);
} else {
  console.log('⚠️  Some security tests failed. Please review.');
  process.exit(1);
}