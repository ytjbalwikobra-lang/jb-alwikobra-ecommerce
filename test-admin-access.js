const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('❌ Missing Supabase admin configuration');
  console.log('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testAdminAccess() {
  console.log('🧪 Testing admin client access to orders and dashboard data...\n');

  // Test 1: Orders data access
  console.log('📊 ORDERS TABLE (Admin Client):');
  try {
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (ordersError) {
      console.log('❌ Error:', ordersError.message);
    } else {
      console.log('✅ Orders found:', orders?.length || 0);
      if (orders && orders.length > 0) {
        console.log('Sample order:');
        console.log(`  - ID: ${orders[0].id}`);
        console.log(`  - Customer: ${orders[0].customer_name}`);
        console.log(`  - Amount: Rp ${orders[0].amount?.toLocaleString('id-ID')}`);
        console.log(`  - Status: ${orders[0].status}`);
        console.log(`  - Created: ${orders[0].created_at}`);
      }
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
  }

  // Test 2: Dashboard data - Products count
  console.log('\n📦 PRODUCTS COUNT:');
  try {
    const { count: productsCount, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id', { count: 'exact', head: true });
    
    if (productsError) {
      console.log('❌ Error:', productsError.message);
    } else {
      console.log('✅ Products count:', productsCount || 0);
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
  }

  // Test 3: Dashboard data - Flash sales count
  console.log('\n⚡ FLASH SALES COUNT:');
  try {
    const { count: flashCount, error: flashError } = await supabaseAdmin
      .from('flash_sales')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('end_time', new Date().toISOString());
    
    if (flashError) {
      console.log('❌ Error:', flashError.message);
    } else {
      console.log('✅ Active flash sales count:', flashCount || 0);
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
  }

  // Test 4: Dashboard data - Orders last 7 days
  console.log('\n📈 ORDERS LAST 7 DAYS:');
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentOrders, error: recentError } = await supabaseAdmin
      .from('orders')
      .select('amount, status, created_at')
      .gte('created_at', sevenDaysAgo);
    
    if (recentError) {
      console.log('❌ Error:', recentError.message);
    } else {
      const orders = recentOrders || [];
      const revenue = orders
        .filter(o => ['paid', 'completed'].includes(o.status))
        .reduce((sum, o) => sum + Number(o.amount || 0), 0);
      
      console.log('✅ Orders last 7 days:', orders.length);
      console.log('✅ Revenue last 7 days: Rp', revenue.toLocaleString('id-ID'));
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
  }

  // Test 5: Users data access
  console.log('\n👥 USERS TABLE (Admin Client):');
  try {
    const { count: usersCount, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact', head: true });
    
    if (usersError) {
      console.log('❌ Error:', usersError.message);
    } else {
      console.log('✅ Users count:', usersCount || 0);
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
  }
}

testAdminAccess().then(() => {
  console.log('\n🏁 Admin access test complete');
}).catch(console.error);
