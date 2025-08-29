import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;

if (!supabaseUrl || !supabaseAnonKey) {
  // Don't instantiate client when config is missing to avoid runtime errors in dev
  console.warn('[Supabase] Missing configuration. Skipping client initialization.');
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
