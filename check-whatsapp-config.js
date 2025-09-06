const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load env
if (fs.existsSync('.env')) {
  const env = fs.readFileSync('.env', 'utf8');
  env.split('\n').forEach(line => {
    if (line.includes('=') && !line.startsWith('#')) {
      const [key, ...parts] = line.split('=');
      process.env[key.trim()] = parts.join('=').replace(/['"]/g, '');
    }
  });
}

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
);

async function checkWhatsApp() {
  console.log('🔍 Checking WhatsApp API configuration...');
  
  // Check for whatsapp_api_keys table
  try {
    const { data, error } = await supabase.from('whatsapp_api_keys').select('*').limit(1);
    if (error) {
      console.log('❌ whatsapp_api_keys error:', error.message);
    } else {
      console.log('✅ whatsapp_api_keys table exists');
      console.log('API Keys count:', data?.length || 0);
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
  }

  // Check for whatsapp_providers table  
  try {
    const { data, error } = await supabase.from('whatsapp_providers').select('*').limit(1);
    if (error) {
      console.log('❌ whatsapp_providers error:', error.message);
    } else {
      console.log('✅ whatsapp_providers table exists');
      console.log('Providers count:', data?.length || 0);
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
  }

  // Check for stored function
  try {
    const { data, error } = await supabase.rpc('get_active_api_key', { provider_name: 'woo-wa' });
    if (error) {
      console.log('❌ get_active_api_key function error:', error.message);
    } else {
      console.log('✅ get_active_api_key function exists');
      console.log('Result:', data);
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
  }
}

checkWhatsApp().catch(console.error);
