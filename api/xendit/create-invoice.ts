// Best practice: keep secret on server
const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY as string | undefined;
const SUPABASE_URL = process.env.SUPABASE_URL as string | undefined;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;

async function createOrderIfProvided(order: any, clientExternalId?: string) {
  try {
    if (!order) {
      console.log('[createOrderIfProvided] No order payload provided');
      return null;
    }
    if (!SUPABASE_URL) {
      console.error('[createOrderIfProvided] Missing SUPABASE_URL env var');
      return null;
    }
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[createOrderIfProvided] Missing SUPABASE_SERVICE_ROLE_KEY env var');
      return null;
    }
    
    console.log('[createOrderIfProvided] Attempting to create order:', { 
      clientExternalId, 
      product_id: order.product_id, 
      customer_name: order.customer_name,
      amount: order.amount 
    });
    
    // Validate product_id if provided (should be UUID format or null)
    if (order.product_id && typeof order.product_id === 'string') {
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(order.product_id);
      if (!isValidUUID) {
        console.error('[createOrderIfProvided] Invalid product_id format:', order.product_id, 'Setting to null');
        order.product_id = null; // Set to null instead of failing
      }
    }
    
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const payload: any = {
      product_id: order.product_id || null,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      order_type: order.order_type || 'purchase',
      amount: order.amount,
      status: 'pending',
      payment_method: 'xendit',
      rental_duration: order.rental_duration || null,
      user_id: order.user_id || null,
      client_external_id: clientExternalId || null,
    };
    // If we have a client external id, try to reuse existing order row to be idempotent
    if (clientExternalId) {
      console.log('[createOrderIfProvided] Checking for existing order with client_external_id:', clientExternalId);
      const existingRes = await sb
        .from('orders')
        .select('*')
        .eq('client_external_id', clientExternalId)
        .limit(1);
      if (existingRes.error) {
        console.error('[createOrderIfProvided] Error checking existing order:', existingRes.error);
      }
      const existing = Array.isArray(existingRes.data) ? existingRes.data[0] : null;
      if (existing) {
        console.log('[createOrderIfProvided] Found existing order:', existing.id);
        // If invoice already attached (likely paid/pending at gateway), just return it
        if (existing.xendit_invoice_id) {
          console.log('[createOrderIfProvided] Existing order already has invoice, returning it');
          return existing;
        }
        // Otherwise, update basic fields and return
        console.log('[createOrderIfProvided] Updating existing order fields');
        const { data: upd } = await sb
          .from('orders')
          .update({
            product_id: payload.product_id,
            customer_name: payload.customer_name,
            customer_email: payload.customer_email,
            customer_phone: payload.customer_phone,
            order_type: payload.order_type,
            amount: payload.amount,
            rental_duration: payload.rental_duration,
            user_id: payload.user_id,
          })
          .eq('id', existing.id)
          .select('*')
          .single();
        if (upd) console.log('[createOrderIfProvided] Updated existing order successfully');
        return upd || existing;
      }
    }

    // Insert new or upsert by client_external_id to avoid race duplicates
    if (clientExternalId) {
      console.log('[createOrderIfProvided] Upserting new order with client_external_id');
      const { data, error } = await sb
        .from('orders')
        .upsert(payload, { onConflict: 'client_external_id' })
        .select('*')
        .single();
      if (error) {
        console.error('[createOrderIfProvided] Upsert error:', error);
        throw error;
      }
      console.log('[createOrderIfProvided] Upserted order successfully:', data?.id);
      return data;
    } else {
      console.log('[createOrderIfProvided] Inserting new order without client_external_id');
      const { data, error } = await sb.from('orders').insert(payload).select('*').single();
      if (error) {
        console.error('[createOrderIfProvided] Insert error:', error);
        throw error;
      }
      console.log('[createOrderIfProvided] Inserted order successfully:', data?.id);
      return data;
    }
  } catch (e) {
    console.error('[createOrderIfProvided] Failed to create order in Supabase:', e);
    return null;
  }
}

async function attachInvoiceToOrder(orderId: string, invoice: any) {
  try {
    if (!orderId || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return;
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const payload: any = {
      xendit_invoice_id: invoice?.id || null,
      xendit_invoice_url: invoice?.invoice_url || null,
      currency: invoice?.currency || 'IDR',
      expires_at: invoice?.expiry_date ? new Date(invoice.expiry_date).toISOString() : null,
      payer_email: invoice?.payer_email || null,
    };
    await sb.from('orders').update(payload).eq('id', orderId);
  } catch (e) {
    console.error('Failed to attach invoice metadata to order:', e);
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!XENDIT_SECRET_KEY) return res.status(500).json({ error: 'Missing XENDIT_SECRET_KEY' });

  try {
  const { external_id, amount, payer_email, description, success_redirect_url, failure_redirect_url, customer, order } = req.body || {};
    console.log('[create-invoice] Request received:', { 
      external_id, 
      amount, 
      hasOrder: !!order, 
      orderKeys: order ? Object.keys(order) : [],
      hasCustomer: !!customer 
    });
    
    if (!external_id || typeof external_id !== 'string') return res.status(400).json({ error: 'external_id (string) is required' });
    if (!amount || typeof amount !== 'number' || amount <= 0) return res.status(400).json({ error: 'amount (number>0) is required' });
    const desc = description || 'Invoice Pembelian JB Alwikobra';
    
    // Optionally create order on server using client external id for idempotency
    const finalExternalId = external_id;
    console.log('[create-invoice] About to create order if provided...');
    const createdOrder = await createOrderIfProvided(order, finalExternalId);
    console.log('[create-invoice] Order creation result:', { orderId: createdOrder?.id, hasOrder: !!createdOrder });

    const withOrderId = (url?: string | null) => {
      if (!url) return undefined;
      if (!createdOrder?.id) return url;
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}order_id=${createdOrder.id}`;
    };

    // setup timeout for network call
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

  console.log('[Xendit] Creating invoice', { external_id: finalExternalId, amount, hasCustomer: !!customer });

    const resp = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${XENDIT_SECRET_KEY}:`).toString('base64'),
        'X-IDEMPOTENCY-KEY': finalExternalId
      },
      body: JSON.stringify({
        external_id: finalExternalId,
        amount,
        payer_email,
        description: desc,
  success_redirect_url: withOrderId(success_redirect_url),
  failure_redirect_url: withOrderId(failure_redirect_url),
        customer,
        metadata: {
          client_external_id: finalExternalId,
          product_id: order?.product_id || null,
          user_id: order?.user_id || null,
          order_type: order?.order_type || 'purchase',
          amount,
          customer_name: order?.customer_name || null,
          customer_email: order?.customer_email || payer_email || null,
          customer_phone: order?.customer_phone || null,
        },
        currency: 'IDR'
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      console.error('[Xendit] Create invoice failed', resp.status, data);
      return res.status(resp.status).json({ error: data?.message || 'Failed to create invoice', details: data });
    }
    console.log('[create-invoice] Xendit invoice created successfully:', data?.id);
    
    // Persist invoice metadata to order
    if (createdOrder?.id) {
      console.log('[create-invoice] Attaching invoice metadata to order:', createdOrder.id);
      await attachInvoiceToOrder(createdOrder.id, data);
    } else {
      console.log('[create-invoice] No order created, skipping metadata attachment');
    }
    return res.status(200).json(data);
  } catch (err: any) {
    console.error('[Xendit] Handler error', err);
    const isAbort = err?.name === 'AbortError';
    return res.status(500).json({ error: 'Internal server error', message: isAbort ? 'Upstream timeout' : (err?.message || String(err)) });
  }
}
