const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

console.log('🧪 TESTING CUSTOMER WHATSAPP NOTIFICATION...');

async function testCustomerNotification() {
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
  console.log('Using test product:', testProduct.name);

  // Create test order with customer phone
  const testOrderData = {
    product_id: testProduct.id,
    customer_name: 'Test Customer',
    customer_email: 'test-customer@example.com',
    customer_phone: '+628123456789', // New PhoneInput format
    order_type: 'purchase',
    amount: 75000,
    status: 'paid',
    payment_method: 'xendit',
    paid_at: new Date().toISOString(),
    client_external_id: 'CUST-TEST-' + Date.now(),
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

  // Test customer notification logic from webhook
  try {
    // Get order with product info (same as webhook query)
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
      return;
    }

    console.log('✅ Order data retrieved:');
    console.log('  Customer:', order.customer_name);
    console.log('  Phone:', order.customer_phone);
    console.log('  Product:', order.products?.name);
    console.log('  Amount:', order.amount);

    // Test phone number formatting (same logic as webhook)
    let customerPhone = order.customer_phone.replace(/\D/g, '');
    if (customerPhone.startsWith('08')) {
      customerPhone = '62' + customerPhone.substring(1);
    } else if (customerPhone.startsWith('8')) {
      customerPhone = '62' + customerPhone;
    } else if (!customerPhone.startsWith('62')) {
      customerPhone = '62' + customerPhone;
    }

    console.log('📞 Original phone:', order.customer_phone);
    console.log('📞 Formatted phone:', customerPhone);

    const product = order.products;
    const productName = product?.name || 'Unknown Product';

    // Generate customer message (exact same as webhook)
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
• Akun game akan dikirim melalui WhatsApp dalam 1-5 Menit
• Jika ada pertanyaan, hubungi support kami

💬 **Support:** wa.me/6289653510125
🌐 **Website:** https://jbalwikobra.com

Terima kasih telah berbelanja di JB Alwikobra! 🎮`;

    console.log('');
    console.log('📱 CUSTOMER MESSAGE TO SEND:');
    console.log('='.repeat(50));
    console.log(customerMessage);
    console.log('='.repeat(50));

    // Send customer notification
    const API_BASE_URL = 'https://notifapi.com';
    const API_KEY = 'f104a4c19ea118dd464e9de20605c4e5';

    console.log('');
    console.log('🚀 Sending customer notification...');
    
    const customerResponse = await fetch(`${API_BASE_URL}/send_message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone_no: customerPhone,
        key: API_KEY,
        message: customerMessage
      })
    });

    console.log('Raw response status:', customerResponse.status);
    console.log('Raw response headers:', Object.fromEntries(customerResponse.headers.entries()));
    
    const responseText = await customerResponse.text();
    console.log('Raw response text:', responseText);
    
    let customerResult;
    try {
      customerResult = JSON.parse(responseText);
    } catch (parseError) {
      console.log('Failed to parse JSON, response was:', responseText);
      customerResult = { error: 'Invalid JSON response', raw: responseText };
    }
    
    console.log('');
    console.log('📊 CUSTOMER NOTIFICATION RESULT:');
    console.log('  Status:', customerResponse.status);
    console.log('  Response:', JSON.stringify(customerResult, null, 2));

    if (customerResponse.ok && (customerResult.code === 200 || customerResult.status === 'success')) {
      console.log('');
      console.log('✅ SUCCESS! Customer notification sent!');
      console.log(`📱 Message ID: ${customerResult.results?.id_message || customerResult.id_message || customerResult.message_id}`);
      console.log(`📞 Sent to: ${customerPhone}`);
      console.log('📝 Message includes complete "Selanjutnya" section');
    } else {
      console.log('');
      console.log('❌ FAILED! Customer notification not sent');
      console.log('🔍 Check the API response above for details');
    }

  } catch (error) {
    console.error('❌ Customer notification test error:', error.message);
    console.error('   Stack:', error.stack);
  }

  // Clean up
  await supabase.from('orders').delete().eq('id', createdOrder.id);
  console.log('');
  console.log('🧹 Test order cleaned up');
}

testCustomerNotification().catch(console.error);
