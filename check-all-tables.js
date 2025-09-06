const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

async function checkAllTables() {
  console.log('🔍 Checking for any order-related tables...\n');
  
  // Check if there are other tables that might contain orders
  const tables = ['orders', 'manual_orders', 'order_items', 'transactions', 'payments'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(3);
      if (!error) {
        console.log(`✅ Table '${table}': ${data?.length || 0} records`);
        if (data && data.length > 0) {
          console.log('Sample:', JSON.stringify(data[0], null, 2));
        }
      } else {
        console.log(`❌ Table '${table}': ${error.message}`);
      }
    } catch (e) {
      console.log(`❌ Table '${table}': ${e.message}`);
    }
    console.log('');
  }

  // Also check the table schema
  console.log('🏗️ Checking orders table schema...');
  try {
    const { data, error } = await supabase.rpc('get_table_schema', { table_name: 'orders' });
    if (!error && data) {
      console.log('Orders table columns:', data);
    }
  } catch (e) {
    console.log('Schema check failed:', e.message);
  }
}

checkAllTables();
