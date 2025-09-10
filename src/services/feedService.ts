import { supabase } from './supabase.ts';

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
  // Batched feed: 1) posts page 2) media for posts 3) counts in one RPC-like call pattern
  async list({ limit = 10, cursor }: { limit?: number; cursor?: string }) {
    if (!supabase) return { posts: [], nextCursor: undefined };

    let query = supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(limit);
    if (cursor) query = query.lt('created_at', cursor);
    const { data: posts, error } = await query;
    if (error || !posts?.length) return { posts: [], nextCursor: undefined };

    const postIds = posts.map((p) => p.id);

    // Fetch media in one go
  const mediaPromise = supabase.from('post_media').select('*').in('post_id', postIds);
  const likesPromise = supabase.rpc('get_post_like_counts', { p_ids: postIds });
  const commentsPromise = supabase.rpc('get_post_comment_counts', { p_ids: postIds });

  const [mediaRes, likesRes, commentsRes] = await Promise.all([mediaPromise, likesPromise, commentsPromise]);
  const media = mediaRes.data || [];
  const likes = likesRes.error ? [] : (likesRes.data as any[]);
  const comments = commentsRes.error ? [] : (commentsRes.data as any[]);

    // Merge counts safely
    const likeMap = new Map<string, number>();
  (likes as any[] | undefined)?.forEach((r) => likeMap.set(r.post_id, r.count));
    const commentMap = new Map<string, number>();
  (comments as any[] | undefined)?.forEach((r) => commentMap.set(r.post_id, r.count));

    const mediaByPost = new Map<string, any[]>();
    (media || []).forEach((m) => {
      const arr = mediaByPost.get(m.post_id) || [];
      arr.push(m);
      mediaByPost.set(m.post_id, arr);
    });

    const merged: FeedPost[] = posts.map((p) => ({
      ...p,
      media: (mediaByPost.get(p.id) || []).sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
      counts: { likes: likeMap.get(p.id) || 0, comments: commentMap.get(p.id) || 0 }
    }));

    const nextCursor = posts.length === limit ? posts[posts.length - 1].created_at : undefined;
    return { posts: merged, nextCursor };
  },

  async toggleLike(postId: string, like: boolean) {
    if (!supabase) return { success: false };
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return { success: false };
    const payload = { post_id: postId, user_id: user.user.id, type: 'like' } as const;
    if (like) {
      const { error } = await supabase.from('post_reactions').upsert(payload);
      return { success: !error };
    } else {
      const { error } = await supabase.from('post_reactions').delete().match(payload);
      return { success: !error };
    }
  },

  async addComment(postId: string, content: string) {
    if (!supabase) return { success: false };
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return { success: false };
    const { error } = await supabase.from('post_comments').insert({ post_id: postId, user_id: user.user.id, content });
    return { success: !error };
  },

  async addReview(productId: string, rating: number, content?: string) {
    if (!supabase) return { success: false, error: 'no-client' };
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return { success: false, error: 'auth' };
    const { error } = await supabase.from('product_reviews').insert({ user_id: user.user.id, product_id: productId, rating, content });
    return { success: !error, error: error?.message };
  }
};
