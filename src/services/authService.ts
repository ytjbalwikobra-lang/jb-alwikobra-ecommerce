/* eslint-disable @typescript-eslint/no-unused-vars */
import { supabase } from './supabase';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-empty */

export type UserProfile = {
  name?: string;
  email?: string;
  phone?: string;
};

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    // Get user data from our custom auth system
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      return {
        name: user.name || undefined,
        email: user.email || undefined,
        phone: user.phone || undefined,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function isLoggedIn(): Promise<boolean> {
  try {
    // Check for our custom session token
    const sessionToken = localStorage.getItem('session_token');
    const userData = localStorage.getItem('user_data');
    const sessionExpires = localStorage.getItem('session_expires');
    
    if (sessionToken && userData && sessionExpires) {
      // Check if session is still valid
      const expiresAt = new Date(sessionExpires);
      if (expiresAt > new Date()) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

export function setLocalUserProfile(profile: UserProfile) {
  localStorage.setItem('user_profile', JSON.stringify(profile));
}

export async function getAuthUserId(): Promise<string | null> {
  try {
    // Get user ID from our custom auth system
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id || null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getUserRole(): Promise<string> {
  try {
    // Since we use custom auth, check the stored user data
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.isAdmin || user.is_admin) {
        return 'admin';
      }
      return 'user';
    }
    return 'guest';
  } catch {
    return 'user';
  }
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  const r = String(role).toLowerCase().trim().replace(/\s+/g, ' ');
  const allowed = ['admin', 'superadmin', 'super-admin', 'super admin', 'owner'];
  return allowed.includes(r);
}

export async function logout(): Promise<void> {
  try {
    // Clear our custom auth session data
    localStorage.removeItem('session_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('session_expires');
    localStorage.removeItem('user_profile'); // Legacy cleanup
  } catch {}
}
