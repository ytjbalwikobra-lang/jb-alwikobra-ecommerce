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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // TODO: Add admin authentication here
    // const isAdmin = await verifyAdminToken(req.headers.authorization);
    // if (!isAdmin) {
    //   return res.status(403).json({ error: 'Admin access required' });
    // }

    switch (req.method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      case 'PUT':
        return handlePut(req, res);
      case 'DELETE':
        return handleDelete(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('WhatsApp API management error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET: List all providers and their API keys
async function handleGet(req: VercelRequest, res: VercelResponse) {
  const { action } = req.query;

  if (action === 'providers') {
    // Get all providers
    const { data: providers, error } = await supabase
      .from('whatsapp_providers')
      .select('*')
      .order('name');

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch providers' });
    }

    return res.json({ providers });
  }

  if (action === 'keys') {
    // Get all API keys with provider info
    const { data: keys, error } = await supabase
      .from('whatsapp_api_keys')
      .select(`
        *,
        whatsapp_providers(name, display_name, base_url)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch API keys' });
    }

    // Hide actual API keys in response (show only masked version)
    const maskedKeys = keys?.map(key => ({
      ...key,
      api_key: maskApiKey(key.api_key)
    }));

    return res.json({ keys: maskedKeys });
  }

  if (action === 'logs') {
    // Get message logs
    const { limit = 50, offset = 0 } = req.query;
    
    const { data: logs, error } = await supabase
      .from('whatsapp_message_logs')
      .select(`
        *,
        whatsapp_providers(name, display_name),
        whatsapp_api_keys(key_name)
      `)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch logs' });
    }

    return res.json({ logs });
  }

  if (action === 'stats') {
    // Get usage statistics
    const { count: totalMessages } = await supabase
      .from('whatsapp_message_logs')
      .select('*', { count: 'exact', head: true });

    const { count: successfulMessages } = await supabase
      .from('whatsapp_message_logs')
      .select('*', { count: 'exact', head: true })
      .eq('success', true);

    const { count: todayMessages } = await supabase
      .from('whatsapp_message_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date().toISOString().split('T')[0]);

    const { data: recentLogs } = await supabase
      .from('whatsapp_message_logs')
      .select(`
        success,
        response_time_ms,
        context_type,
        whatsapp_providers(display_name)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    // Calculate statistics
    const successRate = totalMessages 
      ? (successfulMessages || 0) / totalMessages * 100 
      : 0;

    const avgResponseTime = recentLogs?.length 
      ? recentLogs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / recentLogs.length
      : 0;

    const contextStats = recentLogs?.reduce((acc, log) => {
      acc[log.context_type || 'unknown'] = (acc[log.context_type || 'unknown'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return res.json({
      stats: {
        totalMessages: totalMessages || 0,
        successfulMessages: successfulMessages || 0,
        todayMessages: todayMessages || 0,
        successRate: Math.round(successRate * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime),
        contextStats
      }
    });
  }

  return res.status(400).json({ error: 'Invalid action' });
}

// POST: Add new API key
async function handlePost(req: VercelRequest, res: VercelResponse) {
  const { provider_name, key_name, api_key, is_primary = false } = req.body;

  if (!provider_name || !key_name || !api_key) {
    return res.status(400).json({ 
      error: 'Provider name, key name, and API key are required' 
    });
  }

  // Get provider ID
  const { data: provider, error: providerError } = await supabase
    .from('whatsapp_providers')
    .select('id')
    .eq('name', provider_name)
    .single();

  if (providerError || !provider) {
    return res.status(400).json({ error: 'Provider not found' });
  }

  // If setting as primary, unset other primary keys for this provider
  if (is_primary) {
    await supabase
      .from('whatsapp_api_keys')
      .update({ is_primary: false })
      .eq('provider_id', provider.id);
  }

  // Insert new API key
  const { data: newKey, error } = await supabase
    .from('whatsapp_api_keys')
    .insert({
      provider_id: provider.id,
      key_name,
      api_key,
      is_primary,
      is_active: true
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ 
      error: 'Failed to add API key',
      details: error.message 
    });
  }

  return res.json({ 
    success: true, 
    key: { 
      ...newKey, 
      api_key: maskApiKey(newKey.api_key) 
    } 
  });
}

// PUT: Update API key
async function handlePut(req: VercelRequest, res: VercelResponse) {
  const { key_id, key_name, is_active, is_primary } = req.body;

  if (!key_id) {
    return res.status(400).json({ error: 'Key ID is required' });
  }

  const updates: any = {};
  if (key_name !== undefined) updates.key_name = key_name;
  if (is_active !== undefined) updates.is_active = is_active;
  if (is_primary !== undefined) updates.is_primary = is_primary;

  // If setting as primary, unset other primary keys for this provider
  if (is_primary) {
    const { data: keyData } = await supabase
      .from('whatsapp_api_keys')
      .select('provider_id')
      .eq('id', key_id)
      .single();

    if (keyData) {
      await supabase
        .from('whatsapp_api_keys')
        .update({ is_primary: false })
        .eq('provider_id', keyData.provider_id)
        .neq('id', key_id);
    }
  }

  const { data: updatedKey, error } = await supabase
    .from('whatsapp_api_keys')
    .update(updates)
    .eq('id', key_id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ 
      error: 'Failed to update API key',
      details: error.message 
    });
  }

  return res.json({ 
    success: true, 
    key: { 
      ...updatedKey, 
      api_key: maskApiKey(updatedKey.api_key) 
    } 
  });
}

// DELETE: Remove API key
async function handleDelete(req: VercelRequest, res: VercelResponse) {
  const { key_id } = req.body;

  if (!key_id) {
    return res.status(400).json({ error: 'Key ID is required' });
  }

  const { error } = await supabase
    .from('whatsapp_api_keys')
    .delete()
    .eq('id', key_id);

  if (error) {
    return res.status(500).json({ 
      error: 'Failed to delete API key',
      details: error.message 
    });
  }

  return res.json({ success: true });
}

// Helper function to mask API key (show only first 4 and last 4 characters)
function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) {
    return '*'.repeat(apiKey.length);
  }
  return apiKey.substring(0, 4) + '*'.repeat(apiKey.length - 8) + apiKey.substring(apiKey.length - 4);
}
