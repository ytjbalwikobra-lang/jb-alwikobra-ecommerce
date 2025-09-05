import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase.ts';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{error?: any}>;
  signUp: (email: string, password: string, whatsapp?: string) => Promise<{error?: any; success?: boolean; message?: string; whatsappSent?: boolean}>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    const checkUser = async () => {
      try {
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          setUser(session?.user ?? null);
        } else {
          // Fallback to localStorage for demo mode
          const savedUser = localStorage.getItem('currentUser');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
      } catch (error) {
        console.error('Error checking user session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      if (supabase) {
        const { error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        return { error };
      } else {
        // Demo mode - simple validation
        if (email && password) {
          const demoUser = {
            id: 'demo-user',
            email,
            user_metadata: { name: email.split('@')[0] },
            created_at: new Date().toISOString()
          };
          localStorage.setItem('currentUser', JSON.stringify(demoUser));
          setUser(demoUser as any);
          return {};
        }
        return { error: { message: 'Invalid credentials' } };
      }
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, whatsapp?: string) => {
    try {
      if (supabase) {
        // Use WhatsApp confirmation instead of email confirmation
        if (whatsapp) {
          const response = await fetch('/api/auth/whatsapp-confirm', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email,
              whatsapp,
              name: email.split('@')[0]
            })
          });

          const result = await response.json();
          
          if (result.success) {
            return { 
              success: true, 
              message: 'Konfirmasi telah dikirim via WhatsApp. Silakan cek pesan untuk mengaktifkan akun.',
              whatsappSent: true 
            };
          } else {
            return { error: { message: result.error || 'Gagal mengirim konfirmasi WhatsApp' } };
          }
        } else {
          // Fallback to traditional email signup if no WhatsApp
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: email.split('@')[0],
                whatsapp: whatsapp || '',
                role: 'user'
              }
            }
          });
          return { error };
        }
      } else {
        // Demo mode
        if (email && password) {
          const demoUser = {
            id: 'demo-user-' + Date.now(),
            email,
            user_metadata: { 
              name: email.split('@')[0],
              whatsapp: whatsapp || ''
            },
            created_at: new Date().toISOString()
          };
          localStorage.setItem('currentUser', JSON.stringify(demoUser));
          setUser(demoUser as any);
          
          // Send welcome message via Woo-WA if whatsapp is provided
          if (whatsapp) {
            await sendWelcomeWhatsApp(email.split('@')[0], whatsapp);
          }
          
          return {};
        }
        return { error: { message: 'Invalid data' } };
      }
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      } else {
        localStorage.removeItem('currentUser');
        setUser(null);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Function to send welcome WhatsApp message via Woo-WA
const sendWelcomeWhatsApp = async (name: string, whatsapp: string) => {
  try {
    const welcomeMessage = `🎉 Selamat datang di JB Alwikobra, ${name}!

✅ Akun Anda telah berhasil dibuat
🛒 Sekarang Anda dapat berbelanja dan menikmati berbagai produk gaming kami

📱 Fitur yang tersedia:
• Katalog produk lengkap
• Flash sales eksklusif
• Riwayat pesanan
• Wishlist pribadi
• Notifikasi WhatsApp otomatis

💬 Jika ada pertanyaan, jangan ragu untuk menghubungi customer service kami.

Terima kasih telah bergabung! 🚀`;

    // Format phone number
    const formattedPhone = whatsapp.startsWith('8') ? `62${whatsapp}` : whatsapp;

    const response = await fetch('/api/woo-wa/send-welcome', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: formattedPhone,
        message: welcomeMessage,
        name: name
      }),
    });

    if (!response.ok) {
      console.error('Failed to send welcome WhatsApp message');
    }
  } catch (error) {
    console.error('Error sending welcome WhatsApp:', error);
  }
};
