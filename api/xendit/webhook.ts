// Xendit webhook to update order status in Supabase (robust)
// Configure Xendit to call /api/xendit/webhook with a shared XENDIT_CALLBACK_TOKEN

function mapStatus(x: string | undefined): 'pending'|'paid'|'completed'|'cancelled' {
  const s = (x || '').toUpperCase();
  if (s === 'PAID') return 'paid';
  if (s === 'SETTLED') return 'completed';
  if (s === 'EXPIRED' || s === 'CANCELLED') return 'cancelled';
  return 'pending';
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

    // Fallback: update by external id (we set external_id === order.id when creating invoice)
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
        .eq('id', externalId)
        .select('id');
      if (!e2) updated = (up2 || []).length;
    }

    // Archive product on successful payment
    try {
      if (updated > 0 && (status === 'paid' || status === 'completed')) {
        // Find related product id(s) for the updated orders and archive them
        let q = sb.from('orders').select('product_id').limit(50);
        if (invoiceId) q = q.eq('xendit_invoice_id', invoiceId);
        else if (externalId) q = q.eq('id', externalId);
        const { data: ordersToArchive } = await q;
        const productIds = (ordersToArchive || []).map((o: any) => o.product_id).filter(Boolean);
        if (productIds.length) {
          await sb.from('products').update({ is_active: false, archived_at: new Date().toISOString() }).in('id', productIds);
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
