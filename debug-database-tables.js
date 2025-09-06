const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  for (const line of envLines) {
    if (line.includes('=') && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').replace(/['"]/g, '');
      process.env[key.trim()] = value.trim();
    }
  }
}

// Load environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

console.log('🔍 Checking database tables and admin user...');
console.log('Supabase URL:', supabaseUrl);
console.log('Service Key available:', !!supabaseServiceKey);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkDatabase() {
  console.log('\n🗄️ Checking for users table...');
  
  try {
    // Try to query users table
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, phone, email, role, is_active')
      .limit(5);
    
    if (usersError) {
      console.log('❌ users table error:', usersError.message);
    } else {
      console.log('✅ users table exists with', usersData?.length, 'records');
      console.log('Sample users:', usersData);
    }
  } catch (e) {
    console.log('❌ users table check failed:', e.message);
  }

  console.log('\n🗄️ Checking for whatsapp_users table...');
  
  try {
    // Try to query whatsapp_users table
    const { data: whatsappData, error: whatsappError } = await supabase
      .from('whatsapp_users')
      .select('id, whatsapp, email, role, is_active')
      .limit(5);
    
    if (whatsappError) {
      console.log('❌ whatsapp_users table error:', whatsappError.message);
    } else {
      console.log('✅ whatsapp_users table exists with', whatsappData?.length, 'records');
      console.log('Sample whatsapp_users:', whatsappData);
    }
  } catch (e) {
    console.log('❌ whatsapp_users table check failed:', e.message);
  }

  console.log('\n👤 Looking for admin user...');
  
  // Check for admin in users table
  try {
    const { data: adminUsers, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', '6282242417788');
    
    if (adminError) {
      console.log('❌ Admin user check error:', adminError.message);
    } else {
      console.log('📋 Admin user in users table:', adminUsers);
    }
  } catch (e) {
    console.log('❌ Admin check failed:', e.message);
  }

  // Check for admin in whatsapp_users table
  try {
    const { data: adminWhatsapp, error: adminWhatsappError } = await supabase
      .from('whatsapp_users')
      .select('*')
      .eq('whatsapp', '6282242417788');
    
    if (adminWhatsappError) {
      console.log('❌ Admin whatsapp user check error:', adminWhatsappError.message);
    } else {
      console.log('📋 Admin user in whatsapp_users table:', adminWhatsapp);
    }
  } catch (e) {
    console.log('❌ Admin whatsapp check failed:', e.message);
  }
}

checkDatabase().catch(console.error);
