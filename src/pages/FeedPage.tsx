import React from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

type FeedMedia = {
  type: 'image' | 'video';
  url: string;
};

type FeedItem = {
  id: string;
  user: { name: string; username: string; avatar?: string };
  createdAt: string; // ISO
  content: string;
  media?: FeedMedia[];
  likes: number;
  comments: number;
  shares: number;
};

const MOCK_ITEMS: FeedItem[] = [
  {
    id: '1',
    user: { name: 'Raka', username: 'raka.gg' },
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    content: 'Akhirnya push ke Mythic! Combo hari ini jalan banget 🔥',
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1605901309584-818e25960a8e?q=80&w=1200&auto=format&fit=crop' }
    ],
    likes: 123,
    comments: 24,
    shares: 5
  },
  {
    id: '2',
    user: { name: 'Naya', username: 'nayaplay' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    content: 'Lagi coba build baru buat hero marksman, worth it banget buat late game ✨',
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=1200&auto=format&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop' }
    ],
    likes: 89,
    comments: 12,
    shares: 3
  },
  {
    id: '3',
    user: { name: 'Dimas', username: 'dims.exe' },
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    content: 'Custom lobby seru bareng komunitas. Minggu depan kita adain lagi! 🙌',
    media: [],
    likes: 42,
    comments: 8,
    shares: 1
  }
];

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}d`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}j`;
  return `${Math.floor(diff / 86400)}h`;
}

const FeedPage: React.FC = () => {
  const [items, setItems] = React.useState<FeedItem[]>(MOCK_ITEMS);
  const [loadingMore, setLoadingMore] = React.useState(false);

  const loadMore = async () => {
    setLoadingMore(true);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));
    setItems((prev) => [
      ...prev,
      ...MOCK_ITEMS.map((it) => ({ ...it, id: `${it.id}-${prev.length + Math.random()}` }))
    ]);
    setLoadingMore(false);
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
          {items.map((post) => (
            <article key={post.id} className="bg-black/60 border border-white/10 rounded-xl p-3 sm:p-4 animate-fade-in">
              {/* User row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-xs font-bold">{post.user.name[0]}</div>
                  <div>
                    <div className="text-sm font-medium">{post.user.name}</div>
                    <div className="text-xs text-gray-400">@{post.user.username} · {timeAgo(post.createdAt)}</div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-200" aria-label="More">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              {/* Content */}
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

              {/* Media grid */}
              {post.media && post.media.length > 0 && (
                <div className={`mt-3 grid gap-2 ${post.media.length > 1 ? 'grid-cols-2' : ''}`}>
                  {post.media.map((m, idx) => (
                    <div key={idx} className="overflow-hidden rounded-lg border border-white/10">
                      {m.type === 'image' ? (
                        <img src={m.url} alt={`Media by ${post.user.username}`} className="w-full h-60 object-cover" loading="lazy" />
                      ) : (
                        <video src={m.url} className="w-full h-60 object-cover" controls />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="mt-3 flex items-center justify-between text-xs">
                <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-gray-300">
                  <Heart size={16} className="text-pink-400" /> <span>{post.likes}</span>
                </button>
                <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-gray-300">
                  <MessageCircle size={16} /> <span>{post.comments}</span>
                </button>
                <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-gray-300">
                  <Share2 size={16} /> <span>{post.shares}</span>
                </button>
              </div>
            </article>
          ))}

          <div className="flex justify-center pt-2">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-4 py-2 rounded-lg border border-pink-500/40 text-pink-300 hover:bg-pink-500/10 disabled:opacity-60"
            >
              {loadingMore ? 'Memuat…' : 'Muat lebih banyak'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
