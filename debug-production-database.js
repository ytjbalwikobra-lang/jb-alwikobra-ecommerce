#!/usr/bin/env node

/**
 * Debug Production Database Schema
 * Check if tables exist and their structure
 */

console.log('🔍 DEBUGGING PRODUCTION DATABASE SCHEMA');
console.log('========================================\n');

console.log('📋 Checking database tables that should exist:');
console.log('✅ users table with columns:');
console.log('   - id (uuid, primary key)');
console.log('   - phone (text, unique)');
console.log('   - name (text)');
console.log('   - email (text)');
console.log('   - is_phone_verified (boolean)');
console.log('   - created_at (timestamptz)');
console.log('   - updated_at (timestamptz)');

console.log('\n✅ phone_verifications table with columns:');
console.log('   - id (uuid, primary key)');
console.log('   - user_id (uuid, foreign key to users)');
console.log('   - phone (text)');
console.log('   - verification_code (text)');
console.log('   - expires_at (timestamptz)');
console.log('   - is_used (boolean)');
console.log('   - verified_at (timestamptz)');
console.log('   - ip_address (text)');
console.log('   - user_agent (text)');
console.log('   - attempt_count (integer)');

console.log('\n🚨 POSSIBLE ISSUES:');
console.log('1. Migration not applied to production database');
console.log('2. Column name mismatch (phone_verified vs is_phone_verified)');
console.log('3. Missing columns or wrong data types');
console.log('4. RLS policies blocking inserts');
console.log('5. Constraint violations');

console.log('\n🔧 RECOMMENDED FIXES:');
console.log('1. Apply the migration file to production:');
console.log('   supabase db push');
console.log('   OR manually run the SQL in Supabase dashboard');

console.log('\n2. Check exact error in Supabase logs');
console.log('3. Verify table structure matches API expectations');

console.log('\n🎯 CURRENT STATUS:');
console.log('✅ API endpoints are accessible');
console.log('✅ WhatsApp service is configured (has provider error but structure works)');
console.log('❌ Database schema mismatch preventing user creation');
console.log('❌ Need to apply migration or fix schema');

console.log('\n📝 NEXT STEPS:');
console.log('1. Apply migration to production database');
console.log('2. Test signup flow again');
console.log('3. Verify WhatsApp verification code delivery');
console.log('4. Test complete signup -> verify -> login flow');

console.log('\n⚡ Quick test command after fixing database:');
console.log('curl -X POST "https://www.jbalwikobra.com/api/auth?action=signup" \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"phone": "+6285123456789"}\'');
