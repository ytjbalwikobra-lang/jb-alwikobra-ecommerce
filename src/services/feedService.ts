import { supabase } from './supabase.ts';
import { dedupeRequest, generateCacheKey } from '../utils/requestDeduplicator';

export type FeedPost = {
  id: string;
  author_id: string;
  content: string | null;
  created_at: string;
  is_hidden: boolean;
  media: Array<{ id: string; type: 'image'|'video'; url: string; position: number }>; // joined client-side
  counts: { likes: number; comments: number };
  reacted?: boolean;
};

export const FeedService = {
  // Simple, low-egress list: single select with relational counts + media, minimal columns, in-memory cache
  async list({ limit = 10, cursor }: { limit?: number; cursor?: string }) {
    const cacheKey = generateCacheKey('feed_list', { limit, cursor });
    
    return dedupeRequest(cacheKey, async () => {
      if (!supabase) return { posts: [], nextCursor: undefined };

      // In-memory cache (per session)
      const key = JSON.stringify({ k: 'feed', limit, cursor });
      const hit = feedCache.get(key);
      if (hit && Date.now() - hit.t < FEED_CACHE_TTL) return hit.v;

      // Single call with nested selects and counts; only needed columns
      let query = supabase
        .from('posts')
        .select(`
          id, author_id, content, created_at, is_hidden,
          post_media:post_media ( id, type, url, position, post_id ),
          post_reactions(count),
          post_comments(count)
        `)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (cursor) query = query.lt('created_at', cursor);

      const { data, error } = await query;
      if (error || !data?.length) {
        const empty: { posts: FeedPost[]; nextCursor?: string } = { posts: [], nextCursor: undefined };
        feedCache.set(key, { v: empty, t: Date.now() });
        return empty;
      }

      const mapped: FeedPost[] = (data as any[]).map((p) => {
        const likes = Array.isArray(p.post_reactions) && p.post_reactions[0]?.count ? p.post_reactions[0].count : 0;
        const comments = Array.isArray(p.post_comments) && p.post_comments[0]?.count ? p.post_comments[0].count : 0;
        const media = (p.post_media || []).map((m: any) => ({ id: m.id, type: m.type, url: m.url, position: m.position }));
        return {
          id: p.id,
          author_id: p.author_id,
          content: p.content,
          created_at: p.created_at,
          is_hidden: p.is_hidden,
          media: media.sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)),
          counts: { likes, comments },
        } as FeedPost;
      });

      const nextCursor = mapped.length === limit ? mapped[mapped.length - 1].created_at : undefined;
      const result = { posts: mapped, nextCursor };
      feedCache.set(key, { v: result, t: Date.now() });
      return result;
    });
  },

  async toggleLike(postId: string, like: boolean) {
    const cacheKey = generateCacheKey('feed_toggle_like', { postId, like });
    
    return dedupeRequest(cacheKey, async () => {
      if (!supabase) return { success: false };
      const { data: session } = await supabase.auth.getSession();
      const uid = session?.session?.user?.id;
      if (!uid) return { success: false };
      const payload = { post_id: postId, user_id: uid, type: 'like' } as const;
      if (like) {
        const { error } = await supabase.from('post_reactions').upsert(payload);
        return { success: !error };
      } else {
        const { error } = await supabase.from('post_reactions').delete().match(payload);
        return { success: !error };
      }
    });
  },

  async addComment(postId: string, content: string) {
    const cacheKey = generateCacheKey('feed_add_comment', { postId, content });
    
    return dedupeRequest(cacheKey, async () => {
      if (!supabase) return { success: false };
      const { data: session } = await supabase.auth.getSession();
      const uid = session?.session?.user?.id;
      if (!uid) return { success: false };
      const { error } = await supabase.from('post_comments').insert({ post_id: postId, user_id: uid, content });
      return { success: !error };
    });
  },

  async addReview(productId: string, rating: number, content?: string) {
    const cacheKey = generateCacheKey('feed_add_review', { productId, rating, content });
    
    return dedupeRequest(cacheKey, async () => {
      if (!supabase) return { success: false, error: 'no-client' };
      const { data: session } = await supabase.auth.getSession();
      const uid = session?.session?.user?.id;
      if (!uid) return { success: false, error: 'auth' };
      const { error } = await supabase.from('product_reviews').insert({ user_id: uid, product_id: productId, rating, content });
      return { success: !error, error: error?.message };
    });
  }
};

// Simple in-memory cache for feed lists
const FEED_CACHE_TTL = 60 * 1000; // 60s
const feedCache = new Map<string, { v: { posts: FeedPost[]; nextCursor?: string }; t: number }>();
