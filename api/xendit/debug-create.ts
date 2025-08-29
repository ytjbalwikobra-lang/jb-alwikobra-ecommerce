export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const body = {
      external_id: `debug_${Date.now()}`,
      amount: 10000,
      payer_email: 'debug@example.com',
      description: 'Debug invoice',
      success_redirect_url: req.headers['x-origin'] || undefined,
      failure_redirect_url: req.headers['x-origin'] || undefined,
      customer: { given_names: 'Debug', email: 'debug@example.com' }
    };
    const resp = await fetch(`${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/xendit/create-invoice`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    const data = await resp.json();
    return res.status(resp.status).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: 'debug_failed', message: e?.message || String(e) });
  }
}
