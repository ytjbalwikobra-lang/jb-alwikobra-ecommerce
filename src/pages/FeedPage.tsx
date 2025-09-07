import React, { useEffect, useMemo, useState } from 'react';
import { feedService } from '../services/feedService.ts';
import { useAuth } from '../contexts/TraditionalAuthContext.tsx';

function RatingStars({ value }: { value?: number }) {
  if (!value) return null;
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= value ? 'text-yellow-400' : 'text-gray-600'}>★</span>
      ))}
    </div>
  );
}

const FeedPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const isGuest = !user;
  const isAdmin = !!user?.isAdmin;

  const load = async (p = 1) => {
    setLoading(true);
    const { data } = await feedService.list(p, 10);
    setPosts(p === 1 ? (data || []) : [...posts, ...(data || [])]);
    setLoading(false);
  };

  useEffect(() => { load(1); /* eslint-disable-next-line */ }, []);

  // Minimal quick-create UI for dev testing
  const [newPost, setNewPost] = useState<{title:string;content:string;type:'post'|'announcement'}>({ title: '', content: '', type: 'post' });
  const [newReview, setNewReview] = useState<{title:string;content:string;rating:number;product_id:string}>({ title: '', content: '', rating: 5, product_id: '' });
  const [eligibleProducts, setEligibleProducts] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      if (user) {
        const res = await fetch('/api/feed?action=eligible-products', { headers: { 'Authorization': `Bearer ${localStorage.getItem('session_token')||''}` } });
        const j = await res.json();
        setEligibleProducts(j.products || []);
      }
    })();
  }, [user]);
  const createPost = async () => {
    if (!user) return;
    await feedService.createPost({ title: newPost.title, content: newPost.content, type: newPost.type });
    setNewPost({ title: '', content: '', type: 'post' });
    load(1);
  };
  const createReview = async () => {
    if (!user) return;
    if (!newReview.product_id) return;
    await feedService.createReview({ title: newReview.title, content: newReview.content, rating: newReview.rating, product_id: newReview.product_id });
    setNewReview({ title: '', content: '', rating: 5, product_id: '' });
    load(1);
  };

  const toggleLike = async (post: any) => {
    if (isGuest) return;
    const liked = post.liked_by_me;
    if (liked) {
      const r = await feedService.unlike(post.id);
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, liked_by_me: false, likes_count: r.likes } : p));
    } else {
      const r = await feedService.like(post.id);
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, liked_by_me: true, likes_count: r.likes } : p));
    }
  };

  const [commentInputs, setCommentInputs] = useState<Record<string,string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, any[]>>({});

  const loadComments = async (postId: string) => {
    const { comments } = await feedService.listComments(postId);
    setComments(prev => ({ ...prev, [postId]: comments || [] }));
  };

  const submitComment = async (postId: string, parentId?: string) => {
    if (isGuest) return;
    const content = parentId ? (commentInputs[`reply_${parentId}`] || '') : (commentInputs[postId] || '');
    if (!content.trim()) return;
    const { comment } = await feedService.comment(postId, content, parentId);
    setCommentInputs(prev => ({ ...prev, [postId]: '', [`reply_${parentId}`]: '' }));
    await loadComments(postId);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Community Feed</h1>
      {/* Dev-only create bar */}
      {user && (
        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-2">Buat cepat (dev testing)</div>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="text-xs text-gray-400">Post (Admin only)</div>
              <input value={newPost.title} onChange={e=>setNewPost(p=>({...p,title:e.target.value}))} placeholder="Judul" className="w-full bg-black/60 border border-white/10 rounded px-3 py-2" />
              <textarea value={newPost.content} onChange={e=>setNewPost(p=>({...p,content:e.target.value}))} placeholder="Konten" className="w-full bg-black/60 border border-white/10 rounded px-3 py-2" rows={2} />
              <div className="flex items-center gap-2">
                <select value={newPost.type} onChange={e=>setNewPost(p=>({...p, type: e.target.value as any}))} className="bg-black/60 border border-white/10 rounded px-2 py-1">
                  <option value="post">post</option>
                  <option value="announcement">announcement</option>
                </select>
                <button onClick={createPost} disabled={!isAdmin} className="px-3 py-2 bg-pink-600 rounded disabled:opacity-50">Kirim</button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-gray-400">Review (pembeli saja)</div>
              <input value={newReview.title} onChange={e=>setNewReview(p=>({...p,title:e.target.value}))} placeholder="Judul" className="w-full bg-black/60 border border-white/10 rounded px-3 py-2" />
              <textarea value={newReview.content} onChange={e=>setNewReview(p=>({...p,content:e.target.value}))} placeholder="Konten" className="w-full bg-black/60 border border-white/10 rounded px-3 py-2" rows={2} />
              <div className="flex items-center gap-2">
                <select value={newReview.product_id} onChange={e=>setNewReview(p=>({...p,product_id:e.target.value}))} className="bg-black/60 border border-white/10 rounded px-2 py-1">
                  <option value="">Pilih produk yang pernah dibeli</option>
                  {eligibleProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="number" min={1} max={5} value={newReview.rating} onChange={e=>setNewReview(p=>({...p,rating: Number(e.target.value)}))} className="w-20 bg-black/60 border border-white/10 rounded px-2 py-1" />
                <button onClick={createReview} className="px-3 py-2 bg-pink-600 rounded">Kirim</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {posts.map(post => (
        <div key={post.id} className="bg-black/50 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">{post.users?.name || 'User'} · {new Date(post.created_at).toLocaleString('id-ID')}</div>
            <div className="text-xs px-2 py-1 rounded bg-pink-500/20 text-pink-300">{post.type}</div>
          </div>
          <h3 className="text-lg font-semibold mt-2">{post.title}</h3>
          {post.type === 'review' && <RatingStars value={post.rating} />}
          <p className="text-gray-300 mt-2 whitespace-pre-wrap">{post.content}</p>
          {post.image_url && <img src={post.image_url} alt="post" className="mt-3 rounded-lg border border-white/10" />}
          {post.products?.name && (
            <div className="mt-3 text-sm text-gray-400">Untuk produk: <span className="text-gray-200">{post.products.name}</span></div>
          )}
          <div className="mt-3 flex items-center gap-4 text-sm">
            <button disabled={isGuest} onClick={() => toggleLike(post)} className={`px-3 py-1 rounded border ${post.liked_by_me ? 'border-pink-500 text-pink-400' : 'border-white/10 text-gray-300'} hover:bg-white/5`}>
              ♥ {post.likes_count || 0}
            </button>
            <button onClick={() => { setOpenComments(prev => ({ ...prev, [post.id]: !prev[post.id] })); if (!openComments[post.id]) loadComments(post.id); }} className="px-3 py-1 rounded border border-white/10 text-gray-300 hover:bg-white/5">
              Komentar {post.comments_count || 0}
            </button>
          </div>
          {openComments[post.id] && (
            <div className="mt-3 border-t border-white/10 pt-3 space-y-3">
              {!isGuest && (
                <div className="flex gap-2">
                  <input value={commentInputs[post.id] || ''} onChange={e=>setCommentInputs(prev=>({ ...prev, [post.id]: e.target.value }))} placeholder="Tulis komentar..." className="flex-1 bg-black/60 border border-white/10 rounded px-3 py-2" />
                  <button onClick={() => submitComment(post.id)} className="px-3 py-2 bg-pink-600 rounded">Kirim</button>
                </div>
              )}
              <div className="space-y-3">
                {(comments[post.id] || []).filter(c => !c.parent_comment_id).map(c => (
                  <div key={c.id} className="bg-black/40 border border-white/5 rounded p-3">
                    <div className="text-sm text-gray-400">{c.users?.name || 'User'} · {new Date(c.created_at).toLocaleString('id-ID')}</div>
                    <div className="text-gray-200 mt-1 whitespace-pre-wrap">{c.content}</div>
                    {!isGuest && (
                      <div className="mt-2">
                        <input value={commentInputs[`reply_${c.id}`] || ''} onChange={e=>setCommentInputs(prev=>({ ...prev, [`reply_${c.id}`]: e.target.value }))} placeholder="Balas..." className="w-full bg-black/60 border border-white/10 rounded px-3 py-2" />
                        <div className="text-right mt-1">
                          <button onClick={() => submitComment(post.id, c.id)} className="text-xs px-2 py-1 border border-white/10 rounded hover:bg-white/5">Balas</button>
                        </div>
                      </div>
                    )}
                    {/* Replies */}
                    {(comments[post.id] || []).filter(r => r.parent_comment_id === c.id).map(r => (
                      <div key={r.id} className="mt-2 ml-4 border-l border-white/10 pl-3">
                        <div className="text-xs text-gray-400">{r.users?.name || 'User'} · {new Date(r.created_at).toLocaleString('id-ID')}</div>
                        <div className="text-gray-300 mt-1 whitespace-pre-wrap">{r.content}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
      <div className="text-center">
        <button disabled={loading} onClick={() => { const next = page + 1; setPage(next); load(next); }} className="px-4 py-2 rounded border border-white/10 hover:bg-white/5">{loading ? 'Loading...' : 'Load More'}</button>
      </div>
    </div>
  );
};

export default FeedPage;
