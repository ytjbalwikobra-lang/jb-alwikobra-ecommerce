// Xendit webhook to update order status in Supabase (robust)
// Configure Xendit to call /api/xendit/webhook with a shared XENDIT_CALLBACK_TOKEN

function mapStatus(x: string | undefined): 'pending'|'paid'|'completed'|'cancelled' {
  const s = (x || '').toUpperCase();
  if (s === 'PAID') return 'paid';
  if (s === 'SETTLED') return 'completed';
  if (s === 'EXPIRED' || s === 'CANCELLED') return 'cancelled';
  return 'pending';
}

async function sendOrderPaidNotification(sb: any, invoiceId?: string, externalId?: string) {
  try {
    // Get order details with product information
    let q = sb.from('orders')
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
      .limit(1);
    
    if (invoiceId) q = q.eq('xendit_invoice_id', invoiceId);
    else if (externalId) q = q.eq('client_external_id', externalId);
    
    const { data: orders } = await q;
    const order = orders?.[0];
    
    if (!order) {
      console.log('[WhatsApp] No paid order found for notification');
      return;
    }

    const product = order.products;
    const productName = product?.name || 'Unknown Product';
    
    // Generate notification message
    const message = `🎮 **ORDERAN BARU - PAID** 

👤 **Customer:** ${order.customer_name || 'Guest'}
📧 **Email:** ${order.customer_email || 'Not provided'}
📱 **Phone:** ${order.customer_phone || 'Not provided'}
📋 **Order ID:** ${order.id}

🎯 **Product:** ${productName}
💰 **Amount:** Rp ${Number(order.amount || 0).toLocaleString('id-ID')}
✅ **Status:** PAID

📅 **Paid at:** ${order.paid_at ? new Date(order.paid_at).toLocaleString('id-ID') : 'Just now'}

#OrderPaid`;

    // Send to WhatsApp group (admin notification)
    const API_BASE_URL = 'https://notifapi.com';
    const API_KEY = 'f104a4c19ea118dd464e9de20605c4e5';
    const GROUP_ID = '120363421819020887@g.us'; // ORDERAN WEBSITE group

    const response = await fetch(`${API_BASE_URL}/send_message_group_id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        group_id: GROUP_ID,
        key: API_KEY,
        message: message
      })
    });

    const result = await response.json();
    
    if (response.ok && result.code === 200) {
      console.log(`[WhatsApp] Order paid notification sent successfully: ${result.results?.id_message}`);
    } else {
      console.error('[WhatsApp] Failed to send order paid notification:', result);
    }



    // Send notification to customer if phone number is provided
    if (order.customer_phone) {
      try {
        // Clean phone number (remove non-digits and ensure it starts with 62)
        let customerPhone = order.customer_phone.replace(/\D/g, '');
        
        // Handle different input formats
        if (customerPhone.startsWith('62')) {
          // Already in correct format (62xxxxxxxx)
          customerPhone = customerPhone;
        } else if (customerPhone.startsWith('08')) {
          // Indonesian format starting with 08 (08xxxxxxxx -> 62xxxxxxxx)
          customerPhone = '62' + customerPhone.substring(1);
        } else if (customerPhone.startsWith('8')) {
          // Indonesian format without leading 0 (8xxxxxxxx -> 62xxxxxxxx)
          customerPhone = '62' + customerPhone;
        } else if (customerPhone.startsWith('0')) {
          // Other Indonesian format starting with 0 (0xxxxxxxx -> 62xxxxxxxx)
          customerPhone = '62' + customerPhone.substring(1);
        } else if (customerPhone.length >= 8) {
          // Assume it's Indonesian mobile without country code
          customerPhone = '62' + customerPhone;
        } else {
          console.log(`[WhatsApp] Invalid phone number format: ${order.customer_phone}`);
          return;
        }

        // Generate customer notification message
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

        const customerResponse = await fetch(`${API_BASE_URL}/send_message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            phone_no: customerPhone,
            key: API_KEY,
            message: customerMessage
          })
        });

        const customerResult = await customerResponse.json();
        
        if (customerResponse.ok && (customerResult.code === 200 || customerResult.status === 'success')) {
          console.log(`[WhatsApp] Customer notification sent successfully to ${customerPhone}: ${customerResult.results?.id_message || customerResult.id_message || customerResult.message_id}`);
        } else {
          console.error('[WhatsApp] Failed to send customer notification:', customerResult);
        }
      } catch (customerError) {
        console.error('[WhatsApp] Error sending customer notification:', customerError);
      }
    } else {
      console.log('[WhatsApp] No customer phone number provided, skipping customer notification');
    }
  } catch (error) {
    console.error('[WhatsApp] Error sending order paid notification:', error);
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL as string | undefined;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
  const XENDIT_CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN as string | undefined;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  try {
    // Header validation
    const headerToken = req.headers['x-callback-token'] || req.headers['X-Callback-Token'];
    if (XENDIT_CALLBACK_TOKEN && headerToken !== XENDIT_CALLBACK_TOKEN) {
      return res.status(401).json({ error: 'Invalid callback token' });
    }

    const payload = req.body || {};
    const data = payload.data || payload;
    if (!data || (!data.external_id && !data.id) || !data.status) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const invoiceId: string | undefined = data.id || data.invoice_id;
    const externalId: string | undefined = data.external_id;
    const status = mapStatus(data.status);
    const paidAt: string | null = data.paid_at ? new Date(data.paid_at).toISOString() : (status === 'paid' || status === 'completed') ? new Date().toISOString() : null;
    const paymentChannel: string | null = data.payment_channel || data.payment_method || null;
    const payerEmail: string | null = data.payer_email || data.payer?.email || null;
    const invoiceUrl: string | null = data.invoice_url || null;
    const currency: string | null = data.currency || 'IDR';
    const expiresAt: string | null = data.expiry_date ? new Date(data.expiry_date).toISOString() : null;

    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Try update by invoice id first
    let updated = 0;
    if (invoiceId) {
      const { data: up, error } = await sb
        .from('orders')
        .update({
          status,
          paid_at: paidAt,
          payment_channel: paymentChannel,
          payer_email: payerEmail,
          xendit_invoice_url: invoiceUrl,
          xendit_invoice_id: invoiceId,
          currency,
          expires_at: expiresAt,
        })
        .eq('xendit_invoice_id', invoiceId)
        .select('id');
      if (!error) updated = (up || []).length;
    }

  // Fallback: update by client_external_id (we set external_id === client_external_id when creating invoice)
  if (updated === 0 && externalId) {
      const { data: up2, error: e2 } = await sb
        .from('orders')
        .update({
          status,
          paid_at: paidAt,
          payment_channel: paymentChannel,
          payer_email: payerEmail,
          xendit_invoice_url: invoiceUrl,
          xendit_invoice_id: invoiceId,
          currency,
          expires_at: expiresAt,
        })
    .eq('client_external_id', externalId)
        .select('id');
      if (!e2) updated = (up2 || []).length;
    }

    // If nothing updated yet, try to create/upsert order from metadata for resilience
    if (updated === 0) {
      const meta = (data.metadata || {}) as any;
      if (meta && (externalId || meta.client_external_id)) {
        const clientId = (externalId || meta.client_external_id) as string;
        const baseRow: any = {
          client_external_id: clientId,
          product_id: meta.product_id || null,
          user_id: meta.user_id || null,
          order_type: meta.order_type || 'purchase',
          amount: typeof meta.amount === 'number' ? meta.amount : (data.amount || null),
          customer_name: meta.customer_name || null,
          customer_email: meta.customer_email || payerEmail,
          customer_phone: meta.customer_phone || null,
          status: 'pending',
          payment_method: 'xendit',
        };
        const { error: upErr } = await sb
          .from('orders')
          .upsert(baseRow, { onConflict: 'client_external_id' });
        if (!upErr) {
          // Now update with invoice details
          const { data: up3, error: e3 } = await sb
            .from('orders')
            .update({
              status,
              paid_at: paidAt,
              payment_channel: paymentChannel,
              payer_email: payerEmail,
              xendit_invoice_url: invoiceUrl,
              xendit_invoice_id: invoiceId,
              currency,
              expires_at: expiresAt,
            })
            .eq('client_external_id', clientId)
            .select('id');
          if (!e3) updated = (up3 || []).length;
        }
      }
    }

    // Archive product on successful payment
    try {
      if (updated > 0 && (status === 'paid' || status === 'completed')) {
        // Find related product id(s) for the updated orders and archive them
        let q = sb.from('orders').select('product_id').limit(50);
        if (invoiceId) q = q.eq('xendit_invoice_id', invoiceId);
        else if (externalId) q = q.eq('client_external_id', externalId);
        const { data: ordersToArchive } = await q;
        const productIds = (ordersToArchive || []).map((o: any) => o.product_id).filter(Boolean);
        if (productIds.length) {
          await sb.from('products').update({ is_active: false, archived_at: new Date().toISOString() }).in('id', productIds);
        }

        // Send WhatsApp group notification for paid orders
        if (status === 'paid') {
          await sendOrderPaidNotification(sb, invoiceId, externalId);
        }
      }
    } catch (e) {
      console.error('Failed to archive product after payment:', e);
    }

    return res.status(200).json({ ok: true, updated, by: updated ? (invoiceId ? 'invoice_id' : 'external_id') : 'none' });
  } catch (e: any) {
    console.error('Webhook error:', e);
    return res.status(500).json({ error: 'Internal server error', message: e?.message || String(e) });
  }
}
