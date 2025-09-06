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

async function checkTables() {
  console.log('🔍 Checking phone_verifications table...');
  try {
    const { data, error } = await supabase.from('phone_verifications').select('*').limit(1);
    if (error) {
      console.log('❌ phone_verifications error:', error.message);
    } else {
      console.log('✅ phone_verifications table exists');
      console.log('Sample data:', data);
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
  }

  console.log('\n🔍 Checking user_sessions table...');
  try {
    const { data, error } = await supabase.from('user_sessions').select('*').limit(1);
    if (error) {
      console.log('❌ user_sessions error:', error.message);
    } else {
      console.log('✅ user_sessions table exists');
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
  }
}

checkTables().catch(console.error);
