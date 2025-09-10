import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side admin client (service role)
const serviceUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

let supabaseAdmin: SupabaseClient | null = null;

function looksLikePlaceholder(v: string) {
	return /^(YOUR_|your_|https:\/\/your-project|\$\{|<)/i.test(v);
}

try {
	if (!serviceUrl || !serviceKey || looksLikePlaceholder(serviceUrl) || looksLikePlaceholder(serviceKey)) {
		console.warn('[SupabaseAdmin] Missing/invalid service config. Not initializing admin client.');
	} else {
		supabaseAdmin = createClient(serviceUrl, serviceKey, {
			auth: { autoRefreshToken: false, persistSession: false }
		});
	}
} catch (e) {
	console.error('[SupabaseAdmin] Failed to initialize:', e);
	supabaseAdmin = null;
}

export { supabaseAdmin };
