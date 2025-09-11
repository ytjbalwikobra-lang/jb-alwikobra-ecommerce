import React from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { enhancedFeedService, type FeedPost } from '../services/enhancedFeedService';
import { IOSContainer, IOSCard, IOSButton } from '../components/ios/IOSDesignSystem';

// Fallback loading component
const FeedSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <IOSCard key={i} padding="medium">
        <div className="ios-skeleton h-4 w-32 mb-3"></div>
        <div className="ios-skeleton h-40 w-full mb-4 rounded-lg"></div>
        <div className="flex gap-3">
          <div className="ios-skeleton h-8 w-16 rounded-md"></div>
          <div className="ios-skeleton h-8 w-20 rounded-md"></div>
          <div className="ios-skeleton h-8 w-24 rounded-md"></div>
        </div>
      </IOSCard>
    ))}
  </div>
);

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.max(1, Math.floor(diff))} dtk`;
  if (diff < 3600) return `${Math.floor(diff / 60)} m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} j`;
  return `${Math.floor(diff / 86400)} h`;
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
    <div className="min-h-screen bg-ios-background text-ios-text">
      <IOSContainer maxWidth="md" className="pt-4 pb-24 with-bottom-nav">
        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Feed</h1>
          <IOSButton variant="ghost" size="small" onClick={loadInitialPosts}>Refresh</IOSButton>
        </div>

        {/* Feed list */}
        <div className="space-y-4">
          {loading && <FeedSkeleton />}

          {!loading && (items || []).map((post) => (
            <IOSCard key={post.id} padding="medium" className="animate-fade-in">
              {/* User row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {post.authorAvatarUrl ? (
                    <img
                      src={post.authorAvatarUrl}
                      alt={post.authorName || 'User'}
                      className="w-9 h-9 rounded-full object-cover border border-ios-border"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ios-accent to-pink-600 flex items-center justify-center text-xs font-bold">P</div>
                  )}
                  <div>
                    <div className="text-sm font-medium">{post.authorName || 'Postingan'}</div>
                    <div className="text-xs text-ios-text-secondary">{timeAgo(post.created_at)}</div>
                  </div>
                </div>
                <button className="text-ios-text-secondary hover:text-ios-text" aria-label="More">
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
                    <div key={m.id} className="overflow-hidden rounded-lg border border-ios-border">
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
                <IOSButton
                  variant="ghost"
                  size="small"
                  onClick={() => toggleLike(post.id)}
                  aria-label="Suka"
                >
                  <div className="inline-flex items-center gap-2">
                    <Heart size={16} className="text-ios-accent" />
                    <span className="text-ios-text-secondary">{post.counts.likes}</span>
                  </div>
                </IOSButton>
                <IOSButton
                  variant="ghost"
                  size="small"
                  onClick={() => addComment(post.id)}
                  aria-label="Komentar"
                >
                  <div className="inline-flex items-center gap-2">
                    <MessageCircle size={16} />
                    <span className="text-ios-text-secondary">{post.counts.comments}</span>
                  </div>
                </IOSButton>
                <IOSButton variant="ghost" size="small" aria-label="Bagikan">
                  <div className="inline-flex items-center gap-2">
                    <Share2 size={16} />
                    <span className="text-ios-text-secondary">Bagikan</span>
                  </div>
                </IOSButton>
              </div>
            </IOSCard>
          ))}

          {/* Error state */}
          {error && !loading && (
            <IOSCard padding="medium" className="border border-ios-border">
              <div className="flex items-center justify-between">
                <p className="text-sm text-ios-text-secondary">{error}</p>
                <IOSButton variant="secondary" size="small" onClick={loadInitialPosts}>Coba lagi</IOSButton>
              </div>
            </IOSCard>
          )}

          <div className="flex justify-center pt-2">
            <IOSButton variant="secondary" onClick={loadMore} disabled={loadingMore || !hasMore}>
              {loadingMore ? (
                <span className="inline-flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border border-ios-border border-t-ios-accent" />
                  Memuat…
                </span>
              ) : hasMore ? 'Muat lebih banyak' : 'Sudah semua'}
            </IOSButton>
          </div>
        </div>
      </IOSContainer>
    </div>
  );
};

export default FeedPage;
