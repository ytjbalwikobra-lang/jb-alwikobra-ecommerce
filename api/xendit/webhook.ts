// Xendit webhook to update order status in Supabase
// Configure Xendit callback URLs to point to /api/xendit/webhook
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL as string | undefined;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
  const XENDIT_CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN as string | undefined;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  try {
    // Basic header validation using callback token (set in Xendit Dashboard)
    const headerToken = req.headers['x-callback-token'] || req.headers['X-Callback-Token'];
    if (XENDIT_CALLBACK_TOKEN && headerToken !== XENDIT_CALLBACK_TOKEN) {
      return res.status(401).json({ error: 'Invalid callback token' });
    }

    const event = req.body;
    // Basic validation
    if (!event || !event.data || !event.data.external_id || !event.data.status) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // TODO: Validate Xendit signature header (x-callback-token) if configured

    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const orderId = event.data.external_id; // we used order id as external_id
    let status = 'pending';
    if (event.data.status === 'PAID') status = 'paid';
    else if (event.data.status === 'EXPIRED') status = 'cancelled';
    else if (event.data.status === 'SETTLED') status = 'completed';

    const update: any = { status };
    // Capture payment metadata if present
    if (status === 'paid' || status === 'completed') {
      update.paid_at = new Date().toISOString();
    }
    if (event?.data?.payment_method) {
      update.payment_channel = event.data.payment_method;
    }
    if (event?.data?.payer_email) {
      update.payer_email = event.data.payer_email;
    }

    const { error } = await sb.from('orders').update(update).eq('id', orderId);
    if (error) throw error;

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('Webhook error:', e);
    return res.status(500).json({ error: 'Internal server error', message: e?.message || String(e) });
  }
}
