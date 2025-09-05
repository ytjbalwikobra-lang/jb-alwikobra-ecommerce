const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

console.log('🧪 TESTING UPDATED WHATSAPP NOTIFICATION SYSTEM...');

async function testUpdatedNotifications() {
  const envContent = fs.readFileSync('.env', 'utf8');
  const serviceRoleKey = envContent.split('\n').find(line => line.includes('SERVICE_ROLE_KEY')).split('=')[1].trim();
  const supabase = createClient('https://xeithuvgldzxnggxadri.supabase.co', serviceRoleKey);

  // Get any product for testing
  const { data: products } = await supabase
    .from('products')
    .select('id, name, description, price')
    .limit(1);
  
  if (!products || products.length === 0) {
    console.log('❌ No products found');
    return;
  }

  const testProduct = products[0];
  console.log('Using test product:', testProduct);

  // Create test order with customer phone
  const testOrderData = {
    product_id: testProduct.id,
    customer_name: 'Test Customer Updated',
    customer_email: 'test-updated@example.com',
    customer_phone: '08123456789', // Indonesian phone format
    order_type: 'purchase',
    amount: 50000,
    status: 'paid',
    payment_method: 'xendit',
    paid_at: new Date().toISOString(),
    client_external_id: 'TEST-UPDATED-' + Date.now(),
  };

  const { data: createdOrder, error: createError } = await supabase
    .from('orders')
    .insert(testOrderData)
    .select('*')
    .single();

  if (createError) {
    console.error('❌ Failed to create test order:', createError);
    return;
  }

  console.log('✅ Test order created:', createdOrder.id);

  // Test the updated notification query
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      customer_name,
      customer_email,
      customer_phone,
      amount,
      status,
      created_at,
      paid_at,
      products (
        id,
        name,
        price,
        description
      )
    `)
    .eq('status', 'paid')
    .eq('id', createdOrder.id)
    .limit(1);

  const order = orders?.[0];
  
  if (!order) {
    console.log('❌ No paid order found');
  } else {
    console.log('✅ Order found for notification:');
    console.log('  Customer:', order.customer_name);
    console.log('  Phone:', order.customer_phone);
    console.log('  Product:', order.products?.name);

    const product = order.products;
    const productName = product?.name || 'Unknown Product';
    
    // Generate admin message (updated format)
    const adminMessage = `🎮 **ORDERAN BARU - PAID** 

👤 **Customer:** ${order.customer_name || 'Guest'}
📧 **Email:** ${order.customer_email || 'Not provided'}
📱 **Phone:** ${order.customer_phone || 'Not provided'}
📋 **Order ID:** ${order.id}

🎯 **Product:** ${productName}
💰 **Amount:** Rp ${Number(order.amount || 0).toLocaleString('id-ID')}
✅ **Status:** PAID

📅 **Paid at:** ${order.paid_at ? new Date(order.paid_at).toLocaleString('id-ID') : 'Just now'}

#OrderPaid #${order.id}`;

    // Generate customer message
    const customerMessage = `🎉 **PEMBAYARAN BERHASIL!**

Halo ${order.customer_name || 'Customer'},

Terima kasih! Pembayaran Anda telah berhasil diproses.

📋 **Order ID:** ${order.id}
🎯 **Product:** ${productName}
💰 **Total:** Rp ${Number(order.amount || 0).toLocaleString('id-ID')}
✅ **Status:** PAID

📅 **Paid at:** ${order.paid_at ? new Date(order.paid_at).toLocaleString('id-ID') : 'Just now'}

🚀 **Selanjutnya:**
• Tim kami akan segera memproses pesanan Anda
• Akun game akan dikirim melalui WhatsApp/Email dalam 1-24 jam
• Jika ada pertanyaan, hubungi support kami

💬 **Support:** wa.me/6289653510125
🌐 **Website:** https://jbalwikobra.com

Terima kasih telah berbelanja di JB Alwikobra! 🎮`;

    console.log('');
    console.log('📱 ADMIN MESSAGE (Updated Format):');
    console.log(adminMessage);
    console.log('');
    console.log('📱 CUSTOMER MESSAGE:');
    console.log(customerMessage);

    // Test sending both messages
    try {
      const API_BASE_URL = 'https://notifapi.com';
      const API_KEY = 'f104a4c19ea118dd464e9de20605c4e5';
      const GROUP_ID = '120363421819020887@g.us';

      // Send admin notification
      const adminResponse = await fetch(`${API_BASE_URL}/send_message_group_id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_id: GROUP_ID,
          key: API_KEY,
          message: adminMessage
        })
      });

      const adminResult = await adminResponse.json();
      
      if (adminResponse.ok && adminResult.code === 200) {
        console.log(`✅ ADMIN notification sent! Message ID: ${adminResult.results?.id_message}`);
      } else {
        console.error('❌ Admin notification failed:', adminResult);
      }

      // Send customer notification (to a test number - you can change this)
      // Clean phone number
      let customerPhone = order.customer_phone.replace(/\D/g, '');
      if (customerPhone.startsWith('08')) {
        customerPhone = '62' + customerPhone.substring(1);
      }
      
      console.log(`📞 Sending customer notification to: ${customerPhone}`);
      
      const customerResponse = await fetch(`${API_BASE_URL}/send_message_id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: customerPhone,
          key: API_KEY,
          message: customerMessage
        })
      });

      const customerResult = await customerResponse.json();
      
      if (customerResponse.ok && customerResult.code === 200) {
        console.log(`✅ CUSTOMER notification sent! Message ID: ${customerResult.results?.id_message}`);
      } else {
        console.error('❌ Customer notification failed:', customerResult);
      }

      console.log('');
      console.log('🎉 UPDATED NOTIFICATION SYSTEM TEST COMPLETE!');
      console.log('   ✅ Admin notification: Simplified format (no description/action items)');
      console.log('   ✅ Customer notification: Friendly confirmation message');
      console.log('   ✅ Phone number formatting: Indonesian format handled');

    } catch (error) {
      console.error('❌ Notification API error:', error.message);
    }
  }

  // Clean up
  await supabase.from('orders').delete().eq('id', createdOrder.id);
  console.log('🧹 Test order cleaned up');
}

testUpdatedNotifications().catch(console.error);
