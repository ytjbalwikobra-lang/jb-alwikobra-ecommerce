import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST and OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ status: 'ok' });
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, value, rating, id, url, timestamp, userAgent } = req.body;

    // Log the web vitals data (in production, you might want to send this to a real analytics service)
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Web Vitals Metric:', {
        name,
        value: `${Math.round(value)}ms`,
        rating,
        url: url?.split('?')[0], // Remove query params for privacy
        timestamp: new Date(timestamp).toISOString()
      });
    }

    // In production, you could send this data to:
    // - Google Analytics
    // - Datadog
    // - New Relic
    // - Custom analytics service
    // For now, we'll just acknowledge receipt

    return res.status(200).json({ 
      success: true,
      message: 'Web vitals recorded'
    });
    
  } catch (error) {
    console.error('Analytics endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
