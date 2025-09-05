import { VercelRequest, VercelResponse } from '@vercel/node';

// This endpoint has been deprecated in favor of the new WhatsApp-only authentication system
// All authentication now goes through /api/auth/whatsapp-login and /api/auth/verify-magic-link

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(410).json({ 
    error: 'This endpoint has been deprecated. Please use the new WhatsApp authentication system.',
    newEndpoints: {
      login: '/api/auth/whatsapp-login',
      verify: '/api/auth/verify-magic-link'
    }
  });
}
