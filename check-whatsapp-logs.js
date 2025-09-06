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

async function checkWhatsAppLogs() {
  console.log('📱 Checking WhatsApp message logs...');
  
  try {
    const { data, error } = await supabase
      .from('whatsapp_message_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.log('❌ Error:', error.message);
    } else {
      console.log('✅ Recent WhatsApp messages:', data?.length || 0);
      if (data && data.length > 0) {
        data.forEach(log => {
          console.log('📱', {
            phone: log.phone,
            success: log.success,
            messageType: log.message_type,
            created: log.created_at?.slice(0, 19)
          });
        });
      }
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
  }
  
  // Also check verification records
  console.log('\n🔐 Checking recent phone verifications...');
  try {
    const { data, error } = await supabase
      .from('phone_verifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (error) {
      console.log('❌ Error:', error.message);
    } else {
      console.log('✅ Recent verifications:', data?.length || 0);
      if (data && data.length > 0) {
        data.forEach(ver => {
          console.log('🔐', {
            phone: ver.phone,
            code: ver.verification_code,
            used: ver.is_used,
            expired: new Date(ver.expires_at) < new Date(),
            created: ver.created_at?.slice(0, 19)
          });
        });
      }
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
  }
}

checkWhatsAppLogs().catch(console.error);
