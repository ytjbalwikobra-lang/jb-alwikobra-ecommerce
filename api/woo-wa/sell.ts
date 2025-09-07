import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { DynamicWhatsAppService } from '../_utils/dynamicWhatsAppService';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;

const sb = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function getActiveWhatsAppApiKey(): Promise<{ apiKey: string; keyId: string } | null> {
  try {
    const { data, error } = await sb
      .from('whatsapp_api_keys')
      .select('id, api_key, key_name, is_primary, usage_count, requests_today, requests_this_hour, last_reset_date, last_reset_hour')
      .eq('is_active', true)
      .order('is_primary', { ascending: false })
      .order('requests_this_hour', { ascending: true })
      .order('usage_count', { ascending: true })
      .limit(1);
    if (error) {
      console.error('[Sell] Error fetching API key:', error);
      return null;
    }
    const row = data?.[0];
    if (!row?.api_key) return null;

    // best-effort usage increment
    try {
      await sb.from('whatsapp_api_keys').update({
        usage_count: (row.usage_count || 0) + 1,
        requests_today: (row.requests_today || 0) + 1,
        requests_this_hour: (row.requests_this_hour || 0) + 1,
        last_used_at: new Date().toISOString(),
      }).eq('id', row.id);
    } catch {}

    return { apiKey: row.api_key, keyId: row.id };
  } catch (e) {
    console.error('[Sell] Unexpected error fetching API key:', e);
    return null;
  }
}

function formatPhone62(phone: string): string {
  let cleaned = (phone || '').replace(/\D/g, '');
  if (cleaned.startsWith('8')) cleaned = '62' + cleaned;
  else if (cleaned.startsWith('08')) cleaned = '62' + cleaned.slice(1);
  else if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1);
  return cleaned;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, whatsapp, game_title_id, game_title_name, account_details, estimated_price } = req.body || {};
    if (!name || !whatsapp || !(game_title_id || game_title_name)) {
      return res.status(400).json({ error: 'name, whatsapp, and game title are required' });
    }

    const phone62 = formatPhone62(String(whatsapp));
    const gameLabel = game_title_name || `Game ID: ${game_title_id}`;

    // Compose messages
    const thankYouMessage = `🙏 Terima kasih, ${name}!

Pengajuan jual akun Anda sudah kami terima. Tim kami akan meninjau detail akun dan menghubungi Anda via WhatsApp untuk langkah selanjutnya.

Ringkasan:
• Game: ${gameLabel}
• Estimasi harga: ${estimated_price || '-'}
• Email: ${email || '-'}

Mohon standby, proses review biasanya memakan waktu s.d. 24 jam.

— JB Alwikobra`;

    const timestamp = new Date().toLocaleString('id-ID');
    const groupMessage = `🆕 Pengajuan Jual Akun
${timestamp}

Nama: ${name}
Email: ${email || '-'}
WhatsApp: ${phone62}
Game: ${gameLabel}
Estimasi harga: ${estimated_price || '-'}

Detail akun:
${account_details || '-'}

#SellRequest`;

    // Send to customer via dynamic service
    const dyn = new DynamicWhatsAppService();
    await dyn.sendMessage({ phone: phone62, message: thankYouMessage, messageType: 'text', contextType: 'sell', contextId: `sell-${Date.now()}` });

    // Send to group via Woo-WA
    const API_BASE_URL = 'https://notifapi.com';
    const keyRow = await getActiveWhatsAppApiKey();
    const API_KEY = keyRow?.apiKey;
    const GROUP_ID = process.env.WHATSAPP_GROUP_ID || '120363421819020887@g.us';
    if (!API_KEY) return res.status(500).json({ error: 'No WhatsApp API key configured' });

    const response = await fetch(`${API_BASE_URL}/send_message_group_id`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group_id: GROUP_ID, key: API_KEY, message: groupMessage })
    });
    const result = await response.json();
    if (!response.ok || !(result.code === 200 || result.status === 'success')) {
      console.error('[Sell] Failed to send group message:', result);
      // Still return success for user UX, but include warning
      return res.status(200).json({ success: true, warning: 'Group notification failed', result });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('[Sell] Error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
