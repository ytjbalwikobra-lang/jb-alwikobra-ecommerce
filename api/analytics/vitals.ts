import { VercelRequest, VercelResponse } from '@vercel/node';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
  timestamp: number;
  url: string;
  userAgent?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const metrics: WebVitalMetric[] = Array.isArray(req.body) ? req.body : [req.body];

    // Validate metrics
    for (const metric of metrics) {
      if (!metric.name || typeof metric.value !== 'number') {
        return res.status(400).json({ error: 'Invalid metric data' });
      }
    }

    // Log metrics for development (in production, you'd send to analytics service)
    console.log('📊 Web Vitals Metrics Received:');
    metrics.forEach(metric => {
      const emoji = metric.rating === 'good' ? '✅' : 
                   metric.rating === 'needs-improvement' ? '⚠️' : '❌';
      console.log(`${emoji} ${metric.name}: ${metric.value}ms (${metric.rating})`);
    });

    // In production, you might want to:
    // 1. Store in database
    // 2. Send to analytics service (Google Analytics, Mixpanel, etc.)
    // 3. Alert on poor performance
    
    // Example: Store in database (uncomment if you have a database setup)
    /*
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    for (const metric of metrics) {
      await supabase
        .from('web_vitals')
        .insert({
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          metric_id: metric.id,
          url: metric.url,
          user_agent: metric.userAgent,
          timestamp: new Date(metric.timestamp)
        });
    }
    */

    return res.status(200).json({ 
      success: true, 
      message: 'Metrics received successfully',
      count: metrics.length 
    });

  } catch (error) {
    console.error('❌ Error processing Web Vitals metrics:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process metrics'
    });
  }
}
