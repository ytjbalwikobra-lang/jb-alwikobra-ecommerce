import { supabase } from './supabase.ts';

export type UserProfile = {
  name?: string;
  email?: string;
  phone?: string;
};

// Simple in-memory cache for auth state to reduce localStorage access
const authCache = {
  profile: null as UserProfile | null,
  isLoggedIn: null as boolean | null,
  userId: null as string | null,
  role: null as string | null,
  lastCheck: 0,
  TTL: 30 * 1000 // 30 seconds
};

function isCacheValid(): boolean {
  return Date.now() - authCache.lastCheck < authCache.TTL;
}

function clearAuthCache(): void {
  authCache.profile = null;
  authCache.isLoggedIn = null;
  authCache.userId = null;
  authCache.role = null;
  authCache.lastCheck = 0;
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  if (isCacheValid() && authCache.profile !== null) {
    return authCache.profile;
  }

  try {
    // Get user data from our custom auth system
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      const profile = {
        name: user.name || undefined,
        email: user.email || undefined,
        phone: user.phone || undefined,
      };
      authCache.profile = profile;
      authCache.lastCheck = Date.now();
      return profile;
    }
    authCache.profile = null;
    authCache.lastCheck = Date.now();
    return null;
  } catch {
    authCache.profile = null;
    authCache.lastCheck = Date.now();
    return null;
  }
}

export async function isLoggedIn(): Promise<boolean> {
  if (isCacheValid() && authCache.isLoggedIn !== null) {
    return authCache.isLoggedIn;
  }

  try {
    // Check for our custom session token
    const sessionToken = localStorage.getItem('session_token');
    const userData = localStorage.getItem('user_data');
    const sessionExpires = localStorage.getItem('session_expires');
    
    if (sessionToken && userData && sessionExpires) {
      // Check if session is still valid
      const expiresAt = new Date(sessionExpires);
      const isValid = expiresAt > new Date();
      authCache.isLoggedIn = isValid;
      authCache.lastCheck = Date.now();
      return isValid;
    }
    authCache.isLoggedIn = false;
    authCache.lastCheck = Date.now();
    return false;
  } catch {
    authCache.isLoggedIn = false;
    authCache.lastCheck = Date.now();
    return false;
  }
}

export function setLocalUserProfile(profile: UserProfile) {
  localStorage.setItem('user_profile', JSON.stringify(profile));
}

export async function getAuthUserId(): Promise<string | null> {
  if (isCacheValid() && authCache.userId !== null) {
    return authCache.userId;
  }

  try {
    // Get user ID from our custom auth system
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      const userId = user.id || null;
      authCache.userId = userId;
      authCache.lastCheck = Date.now();
      return userId;
    }
    authCache.userId = null;
    authCache.lastCheck = Date.now();
    return null;
  } catch {
    authCache.userId = null;
    authCache.lastCheck = Date.now();
    return null;
  }
}

export async function getUserRole(): Promise<string> {
  if (isCacheValid() && authCache.role !== null) {
    return authCache.role;
  }

  try {
    // Since we use custom auth, check the stored user data
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      let role = 'user';
      if (user.isAdmin || user.is_admin) {
        role = 'admin';
      } else if (userData) {
        role = 'user';
      } else {
        role = 'guest';
      }
      authCache.role = role;
      authCache.lastCheck = Date.now();
      return role;
    }
    authCache.role = 'guest';
    authCache.lastCheck = Date.now();
    return 'guest';
  } catch {
    authCache.role = 'user';
    authCache.lastCheck = Date.now();
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
    
    // Clear auth cache
    clearAuthCache();
  } catch {}
}
