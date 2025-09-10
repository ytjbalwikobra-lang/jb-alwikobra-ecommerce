import React from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { enhancedFeedService, type FeedPost } from '../services/enhancedFeedService';

// Fallback loading component
const FeedSkeleton: React.FC = () => (
  <div className="space-y-6">
    {[1, 2, 3].map((i) => (
      <div key={i} className="ios-card p-4">
        <div className="ios-skeleton h-4 w-3/4 mb-2"></div>
        <div className="ios-skeleton h-32 w-full mb-3"></div>
        <div className="flex space-x-4">
          <div className="ios-skeleton h-6 w-12"></div>
          <div className="ios-skeleton h-6 w-12"></div>
          <div className="ios-skeleton h-6 w-12"></div>
        </div>
      </div>
    ))}
  </div>
);

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}d`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}j`;
  return `${Math.floor(diff / 86400)}h`;
}

const FeedPage: React.FC = () => {
  const [items, setItems] = React.useState<FeedPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [cursor, setCursor] = React.useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = React.useState(true);

  const loadInitialPosts = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await enhancedFeedService.list({ limit: 10 });
      setItems(result.posts);
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (err: any) {
      console.error('Failed to load posts:', err);
      setError(err.message || 'Gagal memuat feed');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { 
    loadInitialPosts(); 
  }, [loadInitialPosts]);

  const loadMore = async () => {
    if (loadingMore || !hasMore || !cursor) return;
    
    try {
      setLoadingMore(true);
      const result = await enhancedFeedService.list({ limit: 10, cursor });
      setItems(prev => [...prev, ...result.posts]);
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (err: any) {
      console.error('Failed to load more posts:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      // Optimistic update
      setItems(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, counts: { ...p.counts, likes: p.counts.likes + 1 } } 
          : p
      ));
      
      await enhancedFeedService.toggleLike(postId, true);
    } catch (err: any) {
      console.error('Failed to like post:', err);
      // Revert optimistic update on error
      setItems(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, counts: { ...p.counts, likes: Math.max(0, p.counts.likes - 1) } } 
          : p
      ));
    }
  };

  const addComment = async (postId: string) => {
    const content = prompt('Tulis komentar:');
    if (!content?.trim()) return;
    
    try {
      const result = await enhancedFeedService.addComment(postId, content);
      if (result.success) {
        setItems(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, counts: { ...p.counts, comments: p.counts.comments + 1 } } 
            : p
        ));
      }
    } catch (err: any) {
      console.error('Failed to add comment:', err);
    }
  };

  return (
    <div className="min-h-screen bg-app-dark text-gray-200">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-4 pb-24 with-bottom-nav">
        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Feed</h1>
          <button className="text-sm text-pink-400 hover:text-pink-300">Refresh</button>
        </div>

        {/* Feed list */}
        <div className="space-y-4">
          {loading && (
            <div className="bg-black/60 border border-white/10 rounded-xl p-4 animate-pulse">
              <div className="h-4 w-24 bg-white/10 rounded mb-2" />
              <div className="h-3 w-48 bg-white/10 rounded" />
            </div>
          )}

          {!loading && (items || []).map((post) => (
            <article key={post.id} className="bg-black/60 border border-white/10 rounded-xl p-3 sm:p-4 animate-fade-in">
              {/* User row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-xs font-bold">P</div>
                  <div>
                    <div className="text-sm font-medium">Postingan</div>
                    <div className="text-xs text-gray-400">{timeAgo(post.created_at)}</div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-200" aria-label="More">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              {/* Content */}
              {post.content && (
                <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
              )}

              {/* Media grid */}
              {post.media && post.media.length > 0 && (
                <div className={`mt-3 grid gap-2 ${post.media.length > 1 ? 'grid-cols-2' : ''}`}>
                  {post.media.map((m) => (
                    <div key={m.id} className="overflow-hidden rounded-lg border border-white/10">
                      {m.type === 'image' ? (
                        <img src={m.url} alt={`media`} className="w-full h-60 object-cover" loading="lazy" />
                      ) : (
                        <video src={m.url} className="w-full h-60 object-cover" controls />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="mt-3 flex items-center justify-between text-xs">
                <button onClick={() => toggleLike(post.id)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-gray-300">
                  <Heart size={16} className="text-pink-400" /> <span>{post.counts.likes}</span>
                </button>
                <button onClick={() => addComment(post.id)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-gray-300">
                  <MessageCircle size={16} /> <span>{post.counts.comments}</span>
                </button>
                <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-gray-300">
                  <Share2 size={16} /> <span>Bagikan</span>
                </button>
              </div>
            </article>
          ))}

          <div className="flex justify-center pt-2">
            <button
              onClick={loadMore}
              disabled={loadingMore || !hasMore}
              className="px-4 py-2 rounded-lg border border-pink-500/40 text-pink-300 hover:bg-pink-500/10 disabled:opacity-60"
            >
              {loadingMore ? 'Memuat…' : hasMore ? 'Muat lebih banyak' : 'Sudah semua'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
