const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

async function createSampleOrders() {
  console.log('🚀 Creating sample orders for testing...\n');
  
  // First, let's get some products to reference
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name')
    .limit(3);
    
  if (productsError || !products || products.length === 0) {
    console.log('❌ No products found. Cannot create orders without products.');
    return;
  }
  
  console.log('📦 Found products:', products.map(p => `${p.id}: ${p.name}`));
  
  // Create sample orders
  const sampleOrders = [
    {
      product_id: products[0]?.id,
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      customer_phone: '+628123456789',
      order_type: 'purchase',
      amount: 150000,
      status: 'paid',
      payment_method: 'xendit',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
    },
    {
      product_id: products[1]?.id || products[0]?.id,
      customer_name: 'Jane Smith',
      customer_email: 'jane@example.com',
      customer_phone: '+628987654321',
      order_type: 'rental',
      amount: 75000,
      status: 'completed',
      payment_method: 'whatsapp',
      rental_duration: '3 days',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    },
    {
      product_id: products[2]?.id || products[0]?.id,
      customer_name: 'Bob Wilson',
      customer_email: 'bob@example.com',
      customer_phone: '+628555666777',
      order_type: 'purchase',
      amount: 250000,
      status: 'pending',
      payment_method: 'xendit',
      created_at: new Date().toISOString() // now
    },
    {
      product_id: products[0]?.id,
      customer_name: 'Alice Brown',
      customer_email: 'alice@example.com',
      customer_phone: '+628111222333',
      order_type: 'rental',
      amount: 120000,
      status: 'paid',
      payment_method: 'xendit',
      rental_duration: '5 days',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
    }
  ];
  
  try {
    const { data: insertedOrders, error: insertError } = await supabase
      .from('orders')
      .insert(sampleOrders)
      .select();
      
    if (insertError) {
      console.log('❌ Failed to insert orders:', insertError.message);
      
      // Check if it's a column issue
      console.log('\n🔍 Let me check the orders table structure...');
      const { data: existingOrders, error: selectError } = await supabase
        .from('orders')
        .select('*')
        .limit(1);
        
      if (selectError) {
        console.log('❌ Table access error:', selectError.message);
      } else {
        console.log('✅ Table exists and is accessible');
        
        // Try inserting a minimal order
        console.log('\n🧪 Trying minimal order insert...');
        const { data: minimalOrder, error: minimalError } = await supabase
          .from('orders')
          .insert({
            customer_name: 'Test Customer',
            customer_email: 'test@example.com',
            customer_phone: '+628123456789',
            order_type: 'purchase',
            amount: 100000,
            status: 'pending',
            payment_method: 'whatsapp'
          })
          .select();
          
        if (minimalError) {
          console.log('❌ Minimal insert failed:', minimalError.message);
        } else {
          console.log('✅ Minimal order created:', minimalOrder);
        }
      }
    } else {
      console.log('✅ Successfully created sample orders:');
      insertedOrders?.forEach((order, index) => {
        console.log(`${index + 1}. ${order.customer_name} - ${order.order_type} - Rp ${order.amount.toLocaleString('id-ID')} - ${order.status}`);
      });
      
      // Verify the count
      const { count } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true });
        
      console.log(`\n📊 Total orders in database: ${count}`);
    }
  } catch (e) {
    console.log('❌ Exception during insert:', e.message);
  }
}

createSampleOrders();
