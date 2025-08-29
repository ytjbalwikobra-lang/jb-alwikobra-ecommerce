// Best practice: keep secret on server
const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY as string | undefined;
const SUPABASE_URL = process.env.SUPABASE_URL as string | undefined;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;

async function createOrderIfProvided(order: any) {
  try {
    if (!order || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
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
    };
    const { data, error } = await sb.from('orders').insert(payload).select('*').single();
    if (error) throw error;
    return data;
  } catch (e) {
    console.error('Failed to create order in Supabase:', e);
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
    if (!external_id || typeof external_id !== 'string') return res.status(400).json({ error: 'external_id (string) is required' });
    if (!amount || typeof amount !== 'number' || amount <= 0) return res.status(400).json({ error: 'amount (number>0) is required' });
    const desc = description || 'Invoice Pembelian JB Alwikobra';
    
    // Optionally create order on server and use its id as external_id for Xendit
    let finalExternalId = external_id;
    const createdOrder = await createOrderIfProvided(order);
    if (createdOrder?.id) {
      finalExternalId = createdOrder.id;
    }

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
    // Persist invoice metadata to order
    if (createdOrder?.id) {
      await attachInvoiceToOrder(createdOrder.id, data);
    }
    return res.status(200).json(data);
  } catch (err: any) {
    console.error('[Xendit] Handler error', err);
    const isAbort = err?.name === 'AbortError';
    return res.status(500).json({ error: 'Internal server error', message: isAbort ? 'Upstream timeout' : (err?.message || String(err)) });
  }
}
