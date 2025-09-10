/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;

function looksLikePlaceholder(v: string) {
  return /^(YOUR_|your_|\$\{|<)/.test(v) || v.includes('YOUR_SUPABASE_URL') || v.includes('YOUR_SUPABASE_ANON_KEY');
}

function isValidUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && /supabase\.co$/.test(u.hostname);
  } catch (_) {
    return false;
  }
}

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Missing configuration. Skipping client initialization.');
  } else if (looksLikePlaceholder(supabaseUrl) || looksLikePlaceholder(supabaseAnonKey) || !isValidUrl(supabaseUrl)) {
    console.warn('[Supabase] Invalid configuration detected. Skipping client initialization.');
  } else {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (e) {
  console.error('[Supabase] Failed to initialize client:', e);
  supabase = null;
}

export { supabase };
