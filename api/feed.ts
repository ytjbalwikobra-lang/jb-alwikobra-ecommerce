import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function getCurrentUser(req: VercelRequest) {
  try {
    const auth = req.headers['authorization'] || '';
    const token = Array.isArray(auth) ? auth[0] : auth;
    const bearer = token.startsWith('Bearer ') ? token.slice(7) : null;
    if (!bearer) return null;
    const { data: session } = await supabase
      .from('user_sessions')
      .select('user_id, expires_at')
      .eq('session_token', bearer)
      .single();
    if (!session) return null;
    if (session.expires_at && new Date(session.expires_at) < new Date()) return null;
    const { data: user } = await supabase
      .from('users')
      .select('id, name, phone, email, is_admin, phone_verified, profile_completed')
      .eq('id', session.user_id)
      .single();
    if (!user) return null;
    return user;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query as any;
  const me = await getCurrentUser(req);

  try {
    switch (action) {
      case 'upload-image':
        return await uploadImage(req, res, me);
      case 'list':
        return await listFeed(req, res, me);
      case 'create-post':
        return await createPost(req, res, me);
      case 'create-review':
        return await createReview(req, res, me);
      case 'eligible-products':
        return await eligibleProducts(req, res, me);
      case 'like':
        return await likePost(req, res, me);
      case 'unlike':
        return await unlikePost(req, res, me);
      case 'comment':
        return await addComment(req, res, me);
      case 'comments':
        return await listComments(req, res, me);
      case 'edit-review':
        return await editReview(req, res, me);
      case 'admin-delete-post':
        return await adminDeletePost(req, res, me);
      case 'admin-edit-post':
        return await adminEditPost(req, res, me);
      case 'admin-delete-comment':
        return await adminDeleteComment(req, res, me);
      case 'notifications':
        return await getNotifications(req, res, me);
      case 'notifications-read':
        return await readNotifications(req, res, me);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (e) {
    console.error('Feed API error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function uploadImage(req: VercelRequest, res: VercelResponse, me: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!me || !me.is_admin) return res.status(403).json({ error: 'Admin only' });
  const { name, contentType, dataBase64, folder } = req.body || {};
  if (!name || !contentType || !dataBase64) return res.status(400).json({ error: 'Invalid payload' });
  try {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'product-images';
    const safeName = String(name).replace(/[^a-zA-Z0-9-_\.]/g, '_');
    const path = `${folder || 'feed'}/${Date.now()}_${Math.random().toString(36).slice(2)}_${safeName}`;
    const buffer = Buffer.from(dataBase64, 'base64');
    const { error } = await (supabase as any).storage.from(bucket).upload(path, buffer, {
      contentType,
      upsert: false,
      cacheControl: '3600'
    });
    if (error) return res.status(400).json({ error: error.message });
    const { data } = (supabase as any).storage.from(bucket).getPublicUrl(path);
    return res.json({ success: true, publicUrl: data?.publicUrl || null, path });
  } catch (e: any) {
    console.error('uploadImage error', e);
    return res.status(500).json({ error: 'Upload failed' });
  }
}

async function listFeed(req: VercelRequest, res: VercelResponse, me: any) {
  const page = parseInt((req.query.page as string) || '1');
  const limit = parseInt((req.query.limit as string) || '10');
  const offset = (page - 1) * limit;

  // Get total count for pagination
  const { count: totalCount, error: countError } = await supabase
    .from('feed_posts')
    .select('id', { count: 'exact', head: true })
    .eq('is_deleted', false);
  if (countError) return res.status(500).json({ error: 'Failed to count feed' });

  let q = supabase
    .from('feed_posts')
    .select(`
      *,
      users:users!feed_posts_user_id_fkey ( id, name, is_admin ),
      products:products!feed_posts_product_id_fkey ( id, name, image )
    `)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data: posts, error } = await q;
  if (error) return res.status(500).json({ error: 'Failed to load feed' });

  // Determine liked_by_me flags
  let likedBy: Record<string, boolean> = {};
  if (me && posts && posts.length) {
    const ids = posts.map(p => p.id);
    const { data: likes } = await supabase
      .from('feed_post_likes')
      .select('post_id')
      .in('post_id', ids)
      .eq('user_id', me.id);
    likes?.forEach(l => likedBy[l.post_id] = true);
  }

  return res.json({
    success: true,
    page,
    limit,
    total: totalCount || 0,
    data: (posts || []).map((p: any) => ({
      ...p,
      liked_by_me: !!likedBy[p.id]
    }))
  });
}

async function createPost(req: VercelRequest, res: VercelResponse, me: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!me || !me.is_admin) return res.status(403).json({ error: 'Admin only' });
  const { title, content, image_url, type } = req.body || {};
  if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });
  const { data, error } = await supabase
    .from('feed_posts')
    .insert({ user_id: me.id, title, content, image_url: image_url || null, type: type || 'post' })
    .select()
    .single();
  if (error) return res.status(500).json({ error: 'Failed to create post' });
  return res.json({ success: true, post: data });
}

async function userHasPurchase(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('orders')
    .select('id')
    .eq('user_id', userId)
    .in('status', ['paid','completed'])
    .limit(1);
  return !!(data && data.length);
}

async function createReview(req: VercelRequest, res: VercelResponse, me: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!me) return res.status(401).json({ error: 'Login required' });
  const { title, rating, content, product_id, image_url } = req.body || {};
  if (!title || !content || !product_id) {
    return res.status(400).json({ error: 'Title, content and product are required' });
  }
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be 1-5' });
  }
  if (!(await userHasPurchase(me.id))) {
    return res.status(403).json({ error: 'Only buyers can post reviews' });
  }
  const { data, error } = await supabase
    .from('feed_posts')
    .insert({ user_id: me.id, type: 'review', product_id, title, content, rating, image_url: image_url || null })
    .select()
    .single();
  if (error) return res.status(500).json({ error: 'Failed to create review' });
  return res.json({ success: true, post: data });
}

async function likePost(req: VercelRequest, res: VercelResponse, me: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!me) return res.status(401).json({ error: 'Login required' });
  const { post_id } = req.body || {};
  if (!post_id) return res.status(400).json({ error: 'post_id required' });
  // Insert like if not exists
  try {
    await supabase.from('feed_post_likes').insert({ post_id, user_id: me.id });
  } catch (_) {
    // ignore duplicate like
  }
  // Return updated count
  const { data: post } = await supabase.from('feed_posts').select('likes_count').eq('id', post_id).single();
  return res.json({ success: true, likes: post?.likes_count || 0 });
}

async function unlikePost(req: VercelRequest, res: VercelResponse, me: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!me) return res.status(401).json({ error: 'Login required' });
  const { post_id } = req.body || {};
  if (!post_id) return res.status(400).json({ error: 'post_id required' });
  await supabase.from('feed_post_likes').delete().eq('post_id', post_id).eq('user_id', me.id);
  const { data: post } = await supabase.from('feed_posts').select('likes_count').eq('id', post_id).single();
  return res.json({ success: true, likes: post?.likes_count || 0 });
}

async function addComment(req: VercelRequest, res: VercelResponse, me: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!me) return res.status(401).json({ error: 'Login required' });
  const { post_id, content, parent_comment_id } = req.body || {};
  if (!post_id || !content) return res.status(400).json({ error: 'post_id and content required' });
  const { data: comment, error } = await supabase
    .from('feed_comments')
    .insert({ post_id, user_id: me.id, content, parent_comment_id: parent_comment_id || null })
    .select()
    .single();
  if (error) return res.status(500).json({ error: 'Failed to add comment' });

  // Recalculate exact count and set (defensive if triggers are missing)
  try {
    const { count } = await supabase
      .from('feed_comments')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', post_id)
      .eq('is_deleted', false);
    await supabase
      .from('feed_posts')
      .update({ comments_count: count || 0 })
      .eq('id', post_id);
  } catch {}

  // Notifications
  try {
    if (parent_comment_id) {
      const { data: parent } = await supabase.from('feed_comments').select('user_id, post_id').eq('id', parent_comment_id).single();
      if (parent && parent.user_id !== me.id) {
        await supabase.from('feed_notifications').insert({
          user_id: parent.user_id,
          actor_id: me.id,
          post_id: parent.post_id,
          comment_id: comment.id,
          type: 'reply_comment'
        });
      }
    } else {
      const { data: post } = await supabase.from('feed_posts').select('user_id').eq('id', post_id).single();
      if (post && post.user_id !== me.id) {
        await supabase.from('feed_notifications').insert({
          user_id: post.user_id,
          actor_id: me.id,
          post_id,
          comment_id: comment.id,
          type: 'reply_post'
        });
      }
    }
  } catch {}

  // Return updated counter for client convenience
  let newCount = undefined as number | undefined;
  try {
    const { data: postRow } = await supabase.from('feed_posts').select('comments_count').eq('id', post_id).single();
    newCount = postRow?.comments_count;
  } catch {}
  return res.json({ success: true, comment, comments_count: newCount });
}

async function listComments(req: VercelRequest, res: VercelResponse, me: any) {
  const post_id = req.query.post_id as string;
  if (!post_id) return res.status(400).json({ error: 'post_id required' });
  const { data, error } = await supabase
    .from('feed_comments')
  .select('*, users:users!feed_comments_user_id_fkey ( id, name, is_admin )')
    .eq('post_id', post_id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error: 'Failed to load comments' });
  return res.json({ success: true, comments: data || [] });
}

async function editReview(req: VercelRequest, res: VercelResponse, me: any) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  if (!me) return res.status(401).json({ error: 'Login required' });
  const { post_id, title, content, rating, image_url } = req.body || {};
  if (!post_id) return res.status(400).json({ error: 'post_id required' });
  const { data: post } = await supabase.from('feed_posts').select('id, user_id, type').eq('id', post_id).single();
  if (!post || post.user_id !== me.id || post.type !== 'review') {
    return res.status(403).json({ error: 'Not allowed' });
  }
  const update: any = {};
  if (title !== undefined) update.title = title;
  if (content !== undefined) update.content = content;
  if (rating !== undefined) {
    if (typeof rating !== 'number' || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });
    update.rating = rating;
  }
  if (image_url !== undefined) update.image_url = image_url === '' ? null : image_url;
  const { data: updated, error } = await supabase
    .from('feed_posts')
    .update(update)
    .eq('id', post_id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: 'Failed to update review' });
  return res.json({ success: true, post: updated });
}

async function adminDeletePost(req: VercelRequest, res: VercelResponse, me: any) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
  if (!me || !me.is_admin) return res.status(403).json({ error: 'Admin only' });
  const { post_id } = req.query as any;
  if (!post_id) return res.status(400).json({ error: 'post_id required' });
  const { error } = await supabase.from('feed_posts').update({ is_deleted: true }).eq('id', post_id);
  if (error) return res.status(500).json({ error: 'Failed to delete post' });
  return res.json({ success: true });
}

async function adminEditPost(req: VercelRequest, res: VercelResponse, me: any) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  if (!me || !me.is_admin) return res.status(403).json({ error: 'Admin only' });
  const { post_id, title, content, image_url, type } = req.body || {};
  if (!post_id) return res.status(400).json({ error: 'post_id required' });
  const update: any = {};
  if (title !== undefined) update.title = title;
  if (content !== undefined) update.content = content;
  if (image_url !== undefined) update.image_url = image_url || null;
  if (type !== undefined) update.type = type;
  const { data, error } = await supabase
    .from('feed_posts')
    .update(update)
    .eq('id', post_id)
    .select(`*, users:users!feed_posts_user_id_fkey ( id, name, is_admin ), products:products!feed_posts_product_id_fkey ( id, name, image )`)
    .single();
  if (error) return res.status(500).json({ error: 'Failed to edit post' });
  return res.json({ success: true, post: data });
}

async function adminDeleteComment(req: VercelRequest, res: VercelResponse, me: any) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
  if (!me || !me.is_admin) return res.status(403).json({ error: 'Admin only' });
  const { comment_id } = req.query as any;
  if (!comment_id) return res.status(400).json({ error: 'comment_id required' });
  // Soft delete and decrement post counter
  const { data: comment } = await supabase.from('feed_comments').select('id, post_id, is_deleted').eq('id', comment_id).single();
  if (!comment) return res.status(404).json({ error: 'Not found' });
  await supabase.from('feed_comments').update({ is_deleted: true }).eq('id', comment_id);
  // Recalculate comments_count for the post (only non-deleted comments)
  const { count } = await supabase
    .from('feed_comments')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', comment.post_id)
    .eq('is_deleted', false);
  await supabase
    .from('feed_posts')
    .update({ comments_count: count || 0 })
    .eq('id', comment.post_id);
  return res.json({ success: true });
}

async function eligibleProducts(req: VercelRequest, res: VercelResponse, me: any) {
  if (!me) return res.status(401).json({ error: 'Login required' });
  const { data, error } = await supabase
    .from('orders')
    .select('product_id, products:products!orders_product_id_fkey ( id, name, image )')
    .eq('user_id', me.id)
    .in('status', ['paid','completed'])
    .not('product_id', 'is', null)
    .limit(100);
  if (error) return res.status(500).json({ error: 'Failed to load eligible products' });
  const seen: Record<string, any> = {};
  (data || []).forEach((row: any) => {
    const p = row.products;
    if (p?.id && !seen[p.id]) seen[p.id] = p;
  });
  return res.json({ success: true, products: Object.values(seen) });
}

async function getNotifications(req: VercelRequest, res: VercelResponse, me: any) {
  if (!me) return res.status(401).json({ error: 'Login required' });
  const { data, error } = await supabase
    .from('feed_notifications')
    .select('*')
    .eq('user_id', me.id)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) return res.status(500).json({ error: 'Failed to get notifications' });
  return res.json({ success: true, notifications: data || [] });
}

async function readNotifications(req: VercelRequest, res: VercelResponse, me: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!me) return res.status(401).json({ error: 'Login required' });
  const { error } = await supabase
    .from('feed_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', me.id)
    .is('read_at', null);
  if (error) return res.status(500).json({ error: 'Failed to mark as read' });
  return res.json({ success: true });
}
