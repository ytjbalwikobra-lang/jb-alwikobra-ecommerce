// WhatsApp Magic Link Verification API - DEPRECATED
// This endpoint has been deprecated in favor of traditional authentication

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // This endpoint has been deprecated in favor of traditional authentication
  return res.status(410).json({ 
    error: 'WhatsApp magic link verification has been deprecated. Please use the traditional login system.',
    redirectTo: '/auth',
    message: 'Please log in using your phone number and password.'
  });
}
