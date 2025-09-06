import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
  isAdmin: boolean;
  avatarUrl?: string;
  phoneVerified: boolean;
  profileCompleted: boolean;
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

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<{error?: any; success?: boolean; user?: User; sessionToken?: string; profileCompleted?: boolean}>;
  signup: (phone: string, password: string) => Promise<{error?: any; success?: boolean; userId?: string; message?: string}>;
  verifyPhone: (userId: string, code: string) => Promise<{error?: any; success?: boolean; user?: User; sessionToken?: string; nextStep?: string}>;
  completeProfile: (email: string, name: string) => Promise<{error?: any; success?: boolean; user?: User}>;
  logout: (logoutAll?: boolean) => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('session_token');
        const storedUser = localStorage.getItem('user_data');

        if (storedToken && storedUser) {
          const userData = JSON.parse(storedUser);
          
          // Validate session
          const isValid = await validateSession(storedToken);
          if (isValid) {
            setUser(userData);
            setSession({
              expiresAt: localStorage.getItem('session_expires') || '',
              lastActivity: new Date().toISOString()
            });
          } else {
            // Clear invalid session
            localStorage.removeItem('session_token');
            localStorage.removeItem('user_data');
            localStorage.removeItem('session_expires');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Login failed' };
      }

      // Store session data
      localStorage.setItem('session_token', data.session_token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      localStorage.setItem('session_expires', data.expires_at);

      // Update state
      setUser(data.user);
      setSession({
        expiresAt: data.expires_at,
        lastActivity: new Date().toISOString()
      });

      return { 
        success: true, 
        user: data.user, 
        sessionToken: data.session_token,
        profileCompleted: data.profile_completed
      };
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'Network error. Please try again.' };
    }
  };

  const signup = async (phone: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Signup failed' };
      }

      return { 
        success: true, 
        userId: data.user_id,
        message: data.message
      };
    } catch (error) {
      console.error('Signup error:', error);
      return { error: 'Network error. Please try again.' };
    }
  };

  const verifyPhone = async (userId: string, code: string) => {
    try {
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, verification_code: code }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Verification failed' };
      }

      // Store session data
      localStorage.setItem('session_token', data.session_token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      localStorage.setItem('session_expires', data.expires_at);

      // Update state
      setUser(data.user);
      setSession({
        expiresAt: data.expires_at,
        lastActivity: new Date().toISOString()
      });

      return { 
        success: true, 
        user: data.user, 
        sessionToken: data.session_token,
        nextStep: data.next_step
      };
    } catch (error) {
      console.error('Verification error:', error);
      return { error: 'Network error. Please try again.' };
    }
  };

  const completeProfile = async (email: string, name: string) => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      
      if (!sessionToken) {
        return { error: 'Please login first' };
      }

      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Profile completion failed' };
      }

      // Update user data
      localStorage.setItem('user_data', JSON.stringify(data.user));
      setUser(data.user);

      return { 
        success: true, 
        user: data.user
      };
    } catch (error) {
      console.error('Profile completion error:', error);
      return { error: 'Network error. Please try again.' };
    }
  };

  const logout = async (logoutAll = false) => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      
      if (sessionToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({ logout_all: logoutAll }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API success
      localStorage.removeItem('session_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('session_expires');
      setUser(null);
      setSession(null);
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      
      if (!sessionToken) {
        return false;
      }

      const isValid = await validateSession(sessionToken);
      
      if (!isValid) {
        await logout();
        return false;
      }

      // Update last activity
      setSession(prev => prev ? {
        ...prev,
        lastActivity: new Date().toISOString()
      } : null);

      return true;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    }
  };

  const validateSession = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/validate-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionToken: token }),
      });

      return response.ok;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    login,
    signup,
    verifyPhone,
    completeProfile,
    logout,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
