import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ 
        error: 'Phone number and password are required' 
      });
    }

    // Validate Indonesian phone number
    if (!/^62[0-9]{9,13}$/.test(phone)) {
      return res.status(400).json({ 
        error: 'Please provide a valid Indonesian phone number (62xxx)' 
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if phone already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, phone_verified')
      .eq('phone', phone)
      .single();

    if (existingUser) {
      if (existingUser.phone_verified) {
        return res.status(409).json({ 
          error: 'Phone number already registered. Please login instead.' 
        });
      } else {
        // Phone exists but not verified, we can resend verification
        return res.status(409).json({ 
          error: 'Phone number already registered but not verified.',
          can_resend_verification: true,
          user_id: existingUser.id
        });
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        phone,
        password_hash: passwordHash,
        phone_verified: false,
        profile_completed: false
      })
      .select()
      .single();

    if (userError) {
      console.error('User creation error:', userError);
      return res.status(500).json({ error: 'Failed to create account' });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save verification code
    const { error: verificationError } = await supabase
      .from('phone_verifications')
      .insert({
        user_id: user.id,
        phone,
        verification_code: verificationCode,
        expires_at: expiresAt.toISOString(),
        ip_address: getClientIP(req),
        user_agent: req.headers['user-agent']
      });

    if (verificationError) {
      console.error('Verification creation error:', verificationError);
      // Clean up user if verification creation fails
      await supabase.from('users').delete().eq('id', user.id);
      return res.status(500).json({ error: 'Failed to send verification' });
    }

    // Send WhatsApp verification
    const whatsappSent = await sendWhatsAppVerification(phone, verificationCode);

    if (!whatsappSent) {
      console.error('WhatsApp sending failed');
      // Don't fail the signup, just inform user
    }

    return res.status(201).json({
      success: true,
      message: 'Account created. Verification code sent to your WhatsApp.',
      user_id: user.id,
      phone: phone,
      whatsapp_sent: whatsappSent,
      expires_in_minutes: 15
    });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
}

async function sendWhatsAppVerification(phone: string, code: string): Promise<boolean> {
  try {
    // Import the dynamic WhatsApp service
    const { DynamicWhatsAppService } = await import('../../src/services/dynamicWhatsAppService');
    const whatsappService = new DynamicWhatsAppService();

    const result = await whatsappService.sendVerificationCode(phone, code);
    
    console.log('WhatsApp verification result:', result);
    return result.success;

  } catch (error) {
    console.error('WhatsApp sending error:', error);
    return false;
  }
}

function getClientIP(req: VercelRequest): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
         req.headers['x-real-ip'] as string || 
         'unknown';
}
