const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Try both anon key and service role key if available
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkRLSAndPermissions() {
  console.log('🔐 Checking RLS policies and permissions...\n');

  // Test with anon key (what the app uses)
  console.log('📱 Testing with ANON key (app client):');
  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    const { data: ordersAnon, error: errorAnon } = await supabaseAnon
      .from('orders')
      .select('*')
      .limit(5);
    
    if (errorAnon) {
      console.log('❌ Anon access error:', errorAnon.message);
      console.log('   Code:', errorAnon.code);
      console.log('   Details:', errorAnon.details);
      console.log('   Hint:', errorAnon.hint);
    } else {
      console.log('✅ Anon access works, found', ordersAnon?.length || 0, 'orders');
    }
  } catch (e) {
    console.log('❌ Anon exception:', e.message);
  }

  // Test with service role key if available
  if (supabaseServiceKey) {
    console.log('\n🔧 Testing with SERVICE ROLE key (admin):');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
      const { data: ordersAdmin, error: errorAdmin } = await supabaseAdmin
        .from('orders')
        .select('*')
        .limit(5);
      
      if (errorAdmin) {
        console.log('❌ Admin access error:', errorAdmin.message);
      } else {
        console.log('✅ Admin access works, found', ordersAdmin?.length || 0, 'orders');
        if (ordersAdmin && ordersAdmin.length > 0) {
          console.log('Sample order:', JSON.stringify(ordersAdmin[0], null, 2));
        }
      }
    } catch (e) {
      console.log('❌ Admin exception:', e.message);
    }
  } else {
    console.log('\n⚠️ No SERVICE_ROLE_KEY found in environment');
  }

  // Check current user context
  console.log('\n👤 Checking authentication context:');
  try {
    const { data: { user }, error } = await supabaseAnon.auth.getUser();
    if (error) {
      console.log('❌ Auth error:', error.message);
    } else if (user) {
      console.log('✅ User authenticated:', user.id);
      console.log('   Email:', user.email);
      console.log('   Role:', user.role);
    } else {
      console.log('⚠️ No authenticated user');
    }
  } catch (e) {
    console.log('❌ Auth exception:', e.message);
  }

  // Test specific RLS bypass for admin
  console.log('\n🔍 Testing admin authentication simulation:');
  
  // Try to check if we can access with a fake admin session
  // This simulates what happens when admin is logged in
  const { data: { session }, error: sessionError } = await supabaseAnon.auth.getSession();
  console.log('Current session:', session ? 'Found' : 'None');
  
  if (!session) {
    console.log('⚠️ No active session - this might be why RLS blocks access');
    console.log('💡 Admin pages need authenticated session to bypass RLS');
  }
}

checkRLSAndPermissions();
