const { createClient } = require('@supabase/supabase-js');

// Read environment variables
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase environment variables');
  console.log('REACT_APP_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('REACT_APP_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Checking database tables...\n');

  // Check orders table
  console.log('📊 ORDERS TABLE:');
  try {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(5);
    
    if (ordersError) {
      console.log('❌ Error:', ordersError.message);
    } else {
      console.log('✅ Count:', orders?.length || 0);
      if (orders && orders.length > 0) {
        console.log('Sample order:', JSON.stringify(orders[0], null, 2));
      }
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
  }

  console.log('\n📦 PRODUCTS TABLE:');
  try {
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(3);
    
    if (productsError) {
      console.log('❌ Error:', productsError.message);
    } else {
      console.log('✅ Count:', products?.length || 0);
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
  }

  console.log('\n⚡ FLASH_SALES TABLE:');
  try {
    const { data: flashSales, error: flashError } = await supabase
      .from('flash_sales')
      .select('*')
      .limit(3);
    
    if (flashError) {
      console.log('❌ Error:', flashError.message);
    } else {
      console.log('✅ Count:', flashSales?.length || 0);
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
  }

  // Check RLS policies
  console.log('\n🔐 CHECKING RLS POLICIES:');
  try {
    // Try to get count with head request
    const { count: ordersCount, error: countError } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true });
    
    if (countError) {
      console.log('❌ Count error:', countError.message);
    } else {
      console.log('✅ Orders count via head:', ordersCount);
    }
  } catch (e) {
    console.log('❌ Count exception:', e.message);
  }
}

checkDatabase().then(() => {
  console.log('\n🏁 Database check complete');
}).catch(console.error);
