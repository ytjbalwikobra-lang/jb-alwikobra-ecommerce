import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  whatsapp: string;
  name: string;
  fullName?: string;
  isAdmin: boolean;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  notificationPreferences?: {
    whatsapp: boolean;
    email: boolean;
  };
  lastLoginAt?: string;
  createdAt: string;
}

interface Session {
  expiresAt: string;
  lastActivity: string;
}

interface WhatsAppAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  sendMagicLink: (whatsapp: string, name?: string) => Promise<{error?: any; success?: boolean; message?: string; isNewUser?: boolean}>;
  verifyMagicLink: (token: string) => Promise<{error?: any; success?: boolean; user?: User; sessionToken?: string}>;
  logout: (logoutAll?: boolean) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{error?: any}>;
}

const WhatsAppAuthContext = createContext<WhatsAppAuthContextType | undefined>(undefined);

export const useWhatsAppAuth = () => {
  const context = useContext(WhatsAppAuthContext);
  if (!context) {
    throw new Error('useWhatsAppAuth must be used within a WhatsAppAuthProvider');
  }
  return context;
};

export const WhatsAppAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const sessionToken = localStorage.getItem('whatsapp_session_token');
        if (sessionToken) {
          await validateSession(sessionToken);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid session
        localStorage.removeItem('whatsapp_session_token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const validateSession = async (sessionToken: string) => {
    try {
      const response = await fetch('/api/auth/validate-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionToken })
      });

      const result = await response.json();

      if (result.success) {
        setUser(result.user);
        setSession(result.session);
        return result.user;
      } else {
        // Session invalid, clear it
        localStorage.removeItem('whatsapp_session_token');
        setUser(null);
        setSession(null);
        return null;
      }
    } catch (error) {
      console.error('Session validation error:', error);
      localStorage.removeItem('whatsapp_session_token');
      setUser(null);
      setSession(null);
      return null;
    }
  };

  const sendMagicLink = async (whatsapp: string, name?: string) => {
    try {
      const response = await fetch('/api/auth/whatsapp-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ whatsapp, name })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { error: { message: 'Network error' } };
    }
  };

  const verifyMagicLink = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      const result = await response.json();

      if (result.success) {
        // Store session token
        localStorage.setItem('whatsapp_session_token', result.sessionToken);
        setUser(result.user);
        setSession({
          expiresAt: result.expiresAt,
          lastActivity: new Date().toISOString()
        });
      }

      return result;
    } catch (error) {
      return { error: { message: 'Network error' } };
    }
  };

  const logout = async (logoutAll = false) => {
    try {
      const sessionToken = localStorage.getItem('whatsapp_session_token');
      if (sessionToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sessionToken, logoutAll })
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API result
      localStorage.removeItem('whatsapp_session_token');
      setUser(null);
      setSession(null);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const sessionToken = localStorage.getItem('whatsapp_session_token');
      if (!sessionToken || !user) {
        return { error: { message: 'Not authenticated' } };
      }

      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionToken, updates })
      });

      const result = await response.json();

      if (result.success) {
        setUser({ ...user, ...updates });
      }

      return result;
    } catch (error) {
      return { error: { message: 'Network error' } };
    }
  };

  const value = {
    user,
    session,
    loading,
    sendMagicLink,
    verifyMagicLink,
    logout,
    updateProfile
  };

  return (
    <WhatsAppAuthContext.Provider value={value}>
      {children}
    </WhatsAppAuthContext.Provider>
  );
};
