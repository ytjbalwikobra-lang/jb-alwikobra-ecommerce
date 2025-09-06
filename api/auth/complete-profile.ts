import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name } = req.body;
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');

    if (!sessionToken) {
      return res.status(401).json({ error: 'Session token required' });
    }

    if (!email || !name) {
      return res.status(400).json({ 
        error: 'Email and name are required' 
      });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        error: 'Please provide a valid email address' 
      });
    }

    // Validate name
    if (name.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Name must be at least 2 characters long' 
      });
    }

    // Find user session
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('user_id')
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Check if email is already used by another user
    const { data: existingEmailUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .neq('id', session.user_id)
      .single();

    if (existingEmailUser) {
      return res.status(409).json({ 
        error: 'Email address is already registered to another account' 
      });
    }

    // Update user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .update({ 
        email: email.toLowerCase().trim(),
        name: name.trim(),
        profile_completed: true,
        profile_completed_at: new Date().toISOString()
      })
      .eq('id', session.user_id)
      .select()
      .single();

    if (userError) {
      console.error('Profile update error:', userError);
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    // Send welcome message
    if (user.phone) {
      await sendWelcomeMessage(user.phone, user.name, user.email);
    }

    // Return updated user data (without password hash)
    const { password_hash, login_attempts, locked_until, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: 'Profile completed successfully! Welcome to JB Alwikobra!',
      user: safeUser
    });

  } catch (error) {
    console.error('Profile completion error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function sendWelcomeMessage(phone: string, name: string, email: string): Promise<void> {
  try {
    // Import the dynamic WhatsApp service
    const { DynamicWhatsAppService } = await import('../../src/services/dynamicWhatsAppService');
    const whatsappService = new DynamicWhatsAppService();

    const result = await whatsappService.sendWelcomeMessage(name, phone, email);
    
    if (result.success) {
      console.log(`✅ Welcome message sent to ${name} via ${result.provider}`);
    } else {
      console.error(`❌ Failed to send welcome message: ${result.error}`);
    }

  } catch (error) {
    console.error('Welcome message error:', error);
  }
}
