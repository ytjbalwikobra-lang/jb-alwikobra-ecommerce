import { supabase } from './supabase.ts';

export type UserProfile = {
  name?: string;
  email?: string;
  phone?: string;
};

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    if (supabase) {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (user) {
        const meta = (user.user_metadata || {}) as any;
        return {
          name: meta.name || meta.full_name || undefined,
          email: user.email || undefined,
          phone: meta.phone || meta.whatsapp || undefined,
        };
      }
    }
  } catch {}
  // fallback to localStorage profile
  try {
    const raw = localStorage.getItem('user_profile');
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export async function isLoggedIn(): Promise<boolean> {
  try {
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) return true;
    }
  } catch {}
  try {
    return !!localStorage.getItem('user_profile');
  } catch {
    return false;
  }
}

export function setLocalUserProfile(profile: UserProfile) {
  localStorage.setItem('user_profile', JSON.stringify(profile));
}

export async function getAuthUserId(): Promise<string | null> {
  try {
    if (supabase) {
      const { data } = await supabase.auth.getUser();
      return data?.user?.id ?? null;
    }
  } catch {}
  return null;
}
