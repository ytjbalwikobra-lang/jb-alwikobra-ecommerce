#!/usr/bin/env node

/**
 * Simple database inspector to see what's in our Supabase database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

console.log('🔍 Inspecting Supabase Database...\n');

async function inspectTables() {
  const tablesToCheck = [
    'custom_users',
    'whatsapp_auth_sessions', 
    'user_sessions',
    'users', // Supabase default
    'profiles', // Common table name
    'auth', // Auth related
    'products', // Your business tables
    'orders'
  ];

  console.log('📋 Checking table accessibility:\n');

  for (const tableName of tablesToCheck) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (!error) {
        console.log(`✅ ${tableName} - ${count || 0} rows`);
      } else {
        console.log(`❌ ${tableName} - Error: ${error.code} ${error.message}`);
      }
    } catch (err) {
      console.log(`❌ ${tableName} - Exception: ${err.message}`);
    }
  }
}

async function testSpecificQueries() {
  console.log('\n🧪 Testing specific queries:\n');
  
  // Test 1: Try to create a simple record
  console.log('1. Testing whatsapp_auth_sessions insert...');
  try {
    const { data, error } = await supabase
      .from('whatsapp_auth_sessions')
      .insert({
        whatsapp: '6281234567892',
        auth_token: 'test_token_123',
        magic_link: 'https://test.com/verify?token=test',
        expires_at: new Date(Date.now() + 900000).toISOString() // 15 min
      })
      .select();

    if (error) {
      console.log(`❌ Insert failed: ${error.code} - ${error.message}`);
    } else {
      console.log('✅ Insert successful:', data[0]?.id);
      
      // Clean up
      await supabase
        .from('whatsapp_auth_sessions')
        .delete()
        .eq('id', data[0].id);
      console.log('✅ Cleanup completed');
    }
  } catch (err) {
    console.log(`❌ Exception: ${err.message}`);
  }

  // Test 2: Check if we can create custom_users
  console.log('\n2. Testing manual custom_users creation...');
  try {
    // Try a different approach - maybe the table name is reserved
    const { data, error } = await supabase
      .from('whatsapp_users') // Try alternative name
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ whatsapp_users doesn't exist: ${error.code}`);
    } else {
      console.log('✅ whatsapp_users exists');
    }
  } catch (err) {
    console.log(`❌ Exception: ${err.message}`);
  }
}

async function runInspection() {
  await inspectTables();
  await testSpecificQueries();
  
  console.log('\n💡 Recommendations:');
  console.log('1. If custom_users is failing, the table name might be reserved');
  console.log('2. We might need to use a different table name like "whatsapp_users"');
  console.log('3. Check if the SQL was executed completely in Supabase dashboard');
  console.log('4. Verify RLS policies are not blocking access');
}

runInspection().catch(console.error);
