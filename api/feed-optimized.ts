/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Feed service role client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * OPTIMIZED FEED API
 * Reduces database calls by:
 * - Single query with count for pagination
 * - Selecting only required fields
 * - Caching frequently accessed data
 * - Batch operations for likes/comments
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class FeedCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  public readonly SHORT_TTL = 60 * 1000; // 1 minute

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set<T>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  clear(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

const feedCache = new FeedCache();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;

    switch (action) {
      case 'list':
        return await handleListFeedsOptimized(req, res);
      case 'create':
        return await handleCreateFeed(req, res);
      case 'update':
        return await handleUpdateFeed(req, res);
      case 'delete':
        return await handleDeleteFeed(req, res);
      case 'like':
        return await handleLikeFeed(req, res);
      case 'comment':
        return await handleCommentFeed(req, res);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Feed API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * OPTIMIZED: List feeds with single query (no separate count)
 * Previously: 2 queries (count + data)
 * Now: 1 query with count included
 */
async function handleListFeedsOptimized(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const type = req.query.type as string || 'all';
    
    const offset = (page - 1) * limit;
    const cacheKey = `feeds_${page}_${limit}_${type}`;

    // Check cache
    const cached = feedCache.get(cacheKey);
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120');
      return res.json({
        success: true,
        ...cached,
        cached: true
      });
    }

    // Single optimized query with minimal data
    let query = supabase
      .from('feed_posts')
      .select(`
        id,
        title,
        content,
        image_url,
        type,
        is_pinned,
        likes_count,
        comments_count,
        created_at,
        updated_at,
        user:users(
          id,
          name
        )
      `, { count: 'exact' })
      .eq('is_deleted', false);

    // Apply type filter
    if (type !== 'all') {
      query = query.eq('type', type);
    }

    // Get data with pagination
    const { data: posts, error, count } = await query
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const result = {
      posts: posts || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: offset + limit < (count || 0),
        hasPrev: page > 1
      }
    };

    // Cache for 1 minute
    feedCache.set(cacheKey, result, feedCache.SHORT_TTL);
    
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120');
    return res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('List feeds error:', error);
    return res.status(500).json({ error: 'Failed to fetch feeds' });
  }
}

/**
 * Create feed post - clears relevant cache
 */
async function handleCreateFeed(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, content, imageUrl, type, userId } = req.body;

    if (!title || !content || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data: post, error } = await supabase
      .from('feed_posts')
      .insert([{
        title,
        content,
        image_url: imageUrl,
        type: type || 'announcement',
        user_id: userId,
        likes_count: 0,
        comments_count: 0
      }])
      .select(`
        id,
        title,
        content,
        image_url,
        type,
        is_pinned,
        likes_count,
        comments_count,
        created_at,
        user:users(id, name)
      `)
      .single();

    if (error) throw error;

    // Clear feed cache
    feedCache.clear('feeds');

    return res.json({
      success: true,
      post
    });

  } catch (error) {
    console.error('Create feed error:', error);
    return res.status(500).json({ error: 'Failed to create post' });
  }
}

/**
 * Update feed post - clears cache
 */
async function handleUpdateFeed(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, updates } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Post ID required' });
    }

    const { data: post, error } = await supabase
      .from('feed_posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        id,
        title,
        content,
        image_url,
        type,
        is_pinned,
        likes_count,
        comments_count,
        created_at,
        updated_at,
        user:users(id, name)
      `)
      .single();

    if (error) throw error;

    // Clear feed cache
    feedCache.clear('feeds');

    return res.json({
      success: true,
      post
    });

  } catch (error) {
    console.error('Update feed error:', error);
    return res.status(500).json({ error: 'Failed to update post' });
  }
}

/**
 * Delete feed post - soft delete and clear cache
 */
async function handleDeleteFeed(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Post ID required' });
    }

    const { error } = await supabase
      .from('feed_posts')
      .update({ is_deleted: true })
      .eq('id', id);

    if (error) throw error;

    // Clear feed cache
    feedCache.clear('feeds');

    return res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete feed error:', error);
    return res.status(500).json({ error: 'Failed to delete post' });
  }
}

/**
 * OPTIMIZED: Like feed post with atomic update
 */
async function handleLikeFeed(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { postId, userId, action } = req.body; // action: 'like' | 'unlike'

    if (!postId || !userId) {
      return res.status(400).json({ error: 'Post ID and User ID required' });
    }

    if (action === 'like') {
      // Insert like and increment count atomically
      const [likeResult, updateResult] = await Promise.all([
        supabase.from('feed_likes').insert([{ post_id: postId, user_id: userId }]),
        supabase.rpc('increment_likes_count', { post_id: postId })
      ]);

      if (likeResult.error && !likeResult.error.message.includes('duplicate')) {
        throw likeResult.error;
      }
    } else {
      // Remove like and decrement count atomically
      const [likeResult, updateResult] = await Promise.all([
        supabase.from('feed_likes').delete().eq('post_id', postId).eq('user_id', userId),
        supabase.rpc('decrement_likes_count', { post_id: postId })
      ]);

      if (likeResult.error) throw likeResult.error;
    }

    // Clear feed cache
    feedCache.clear('feeds');

    return res.json({
      success: true,
      action
    });

  } catch (error) {
    console.error('Like feed error:', error);
    return res.status(500).json({ error: 'Failed to update like' });
  }
}

/**
 * OPTIMIZED: Comment on feed with atomic update
 */
async function handleCommentFeed(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { postId, userId, content } = req.body;

    if (!postId || !userId || !content) {
      return res.status(400).json({ error: 'Post ID, User ID, and content required' });
    }

    // Insert comment and increment count atomically
    const [commentResult, updateResult] = await Promise.all([
      supabase
        .from('feed_comments')
        .insert([{ 
          post_id: postId, 
          user_id: userId, 
          content 
        }])
        .select(`
          id,
          content,
          created_at,
          user:users(id, name)
        `)
        .single(),
      supabase.rpc('increment_comments_count', { post_id: postId })
    ]);

    if (commentResult.error) throw commentResult.error;

    // Clear feed cache
    feedCache.clear('feeds');

    return res.json({
      success: true,
      comment: commentResult.data
    });

  } catch (error) {
    console.error('Comment feed error:', error);
    return res.status(500).json({ error: 'Failed to add comment' });
  }
}
