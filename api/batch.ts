import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface BatchRequest {
  id: string;
  endpoint: string;
  method: string;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

interface BatchResponse {
  id: string;
  data?: any;
  error?: string;
  status: number;
}

/**
 * Batch API endpoint to handle multiple requests in a single call
 * Reduces database egress by combining multiple API calls
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { requests }: { requests: BatchRequest[] } = req.body;

    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({ error: 'Invalid requests array' });
    }

    // Limit batch size to prevent abuse
    if (requests.length > 20) {
      return res.status(400).json({ error: 'Too many requests in batch (max 20)' });
    }

    const responses: BatchResponse[] = [];

    // Process requests in parallel for better performance
    await Promise.all(
      requests.map(async (request) => {
        try {
          const response = await processRequest(request);
          responses.push({
            id: request.id,
            data: response.data,
            status: response.status,
          });
        } catch (error) {
          responses.push({
            id: request.id,
            error: error instanceof Error ? error.message : 'Unknown error',
            status: 500,
          });
        }
      })
    );

    // Sort responses to match request order
    const sortedResponses = requests.map(req => 
      responses.find(res => res.id === req.id)!
    );

    return res.status(200).json({ responses: sortedResponses });

  } catch (error) {
    console.error('Batch API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Process individual request within batch
 */
async function processRequest(request: BatchRequest): Promise<{ data: any; status: number }> {
  const { endpoint, method, params } = request;

  switch (endpoint) {
    case 'products':
      return await handleProductsRequest(method, params);
    
    case 'feed':
      return await handleFeedRequest(method, params);
    
    case 'admin/stats':
      return await handleAdminStatsRequest(method, params);
    
    case 'admin/orders':
      return await handleAdminOrdersRequest(method, params);
    
    case 'admin/products':
      return await handleAdminProductsRequest(method, params);
    
    case 'categories':
      return await handleCategoriesRequest(method, params);
    
    case 'banners':
      return await handleBannersRequest(method, params);
    
    default:
      throw new Error(`Unsupported endpoint: ${endpoint}`);
  }
}

async function handleProductsRequest(method: string, params?: Record<string, any>) {
  if (method === 'GET') {
    const { page = 1, limit = 20, category, search } = params || {};
    
    let query = supabase
      .from('products')
      .select(`
        *,
        product_categories!inner(
          categories(id, name, slug)
        )
      `)
      .eq('status', 'active')
      .range((page - 1) * limit, page * limit - 1);

    if (category) {
      query = query.eq('product_categories.category_id', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return { data, status: 200 };
  }
  
  throw new Error(`Unsupported method: ${method}`);
}

async function handleFeedRequest(method: string, params?: Record<string, any>) {
  if (method === 'GET') {
    const { page = 1, limit = 20 } = params || {};
    
    const { data, error } = await supabase.rpc('get_optimized_feed_with_engagement', {
      p_page: page,
      p_limit: limit
    });
    
    if (error) throw error;
    return { data, status: 200 };
  }
  
  throw new Error(`Unsupported method: ${method}`);
}

async function handleAdminStatsRequest(method: string, params?: Record<string, any>) {
  if (method === 'GET') {
    const { data, error } = await supabase.rpc('get_comprehensive_admin_stats');
    
    if (error) throw error;
    return { data, status: 200 };
  }
  
  throw new Error(`Unsupported method: ${method}`);
}

async function handleAdminOrdersRequest(method: string, params?: Record<string, any>) {
  if (method === 'GET') {
    const { page = 1, limit = 20, status, search } = params || {};
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items(
          id,
          quantity,
          price,
          products(id, name, image_url)
        ),
        customers(id, name, email, phone)
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`order_number.ilike.%${search}%,customers.name.ilike.%${search}%`);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return { data, status: 200 };
  }
  
  throw new Error(`Unsupported method: ${method}`);
}

async function handleAdminProductsRequest(method: string, params?: Record<string, any>) {
  if (method === 'GET') {
    const { page = 1, limit = 20, category, status } = params || {};
    
    let query = supabase
      .from('products')
      .select(`
        *,
        product_categories(
          categories(id, name, slug)
        )
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (category) {
      query = query.eq('product_categories.category_id', category);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return { data, status: 200 };
  }
  
  throw new Error(`Unsupported method: ${method}`);
}

async function handleCategoriesRequest(method: string, params?: Record<string, any>) {
  if (method === 'GET') {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('status', 'active')
      .order('name');
    
    if (error) throw error;
    return { data, status: 200 };
  }
  
  throw new Error(`Unsupported method: ${method}`);
}

async function handleBannersRequest(method: string, params?: Record<string, any>) {
  if (method === 'GET') {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    
    if (error) throw error;
    return { data, status: 200 };
  }
  
  throw new Error(`Unsupported method: ${method}`);
}
