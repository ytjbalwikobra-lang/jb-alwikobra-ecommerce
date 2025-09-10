import React, { useEffect, useState, useCallback } from 'react';
import { feedService } from '../services/feedService';
import { useAuth } from '../contexts/TraditionalAuthContext';
import { useToast } from '../components/Toast';

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

function RatingSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1 select-none" aria-label="Pilih rating">
      {[1,2,3,4,5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={`text-2xl leading-none ${i <= value ? 'text-yellow-400' : 'text-gray-600'} hover:scale-110 transition-transform`}
          title={`${i} bintang`}
        >
          ★
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-400">{value}/5</span>
    </div>
  );
}

function RolePill({ isAdmin }: { isAdmin?: boolean }) {
  const text = isAdmin ? 'Admin' : 'Member';
  const cls = isAdmin ? 'bg-red-500/20 text-red-300 border-red-400/30' : 'bg-blue-500/20 text-blue-300 border-blue-400/30';
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border ${cls}`}>{text}</span>;
}

// Narrow unknown errors into a friendly message without using any
function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string' && err) return err;
  if (err && typeof err === 'object' && 'message' in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === 'string' && m) return m;
  }
  return fallback;
}

const FeedPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  type FeedItem = {
    id: string;
    type: 'post' | 'announcement' | 'review';
    title?: string;
    content?: string;
    rating?: number;
    image_url?: string;
    created_at: string;
    user_id: string;
    users?: { name?: string; avatar_url?: string; is_admin?: boolean };
    products?: { name?: string };
    liked_by_me?: boolean;
    likes_count?: number;
    comments_count?: number;
    is_pinned?: boolean;
  };
  const [posts, setPosts] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<'all'|'announcement'|'review'>('all');
  const limit = 10;
  const isGuest = !user;
  const isAdmin = !!user?.isAdmin;

  // Modal state
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showCreateReviewModal, setShowCreateReviewModal] = useState(false);
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<{ title: string; content: string; type: 'post'|'announcement'; imageFile?: File | null; removeImage?: boolean }>({ title: '', content: '', type: 'post' });
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [editReviewPost, setEditReviewPost] = useState<FeedItem | null>(null);
  const [editReviewFields, setEditReviewFields] = useState<{ title: string; content: string; rating: number }>({ title: '', content: '', rating: 5 });

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    const { data, total } = await feedService.list(p, limit, filter);
    setPosts(data || []);
    setTotal(total || 0);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(1); }, [load]);
  // Mark notifications read and hide badge when entering feed route
  useEffect(() => {
    try {
      const token = localStorage.getItem('session_token') || '';
      if (token) fetch('/api/feed?action=notifications-read', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      // smooth hide via nav components will also clear state
    } catch {}
  }, []);

  // Create bars
  const [newPost, setNewPost] = useState<{title:string;content:string;type:'post'|'announcement'}>({ title: '', content: '', type: 'post' });
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [newPostPreview, setNewPostPreview] = useState<string | null>(null);
  const [newReview, setNewReview] = useState<{title:string;content:string;rating:number;product_id:string}>({ title: '', content: '', rating: 5, product_id: '' });
  type EligibleProduct = { id: string; name: string };
  // const [eligibleProducts, setEligibleProducts] = useState<EligibleProduct[]>([]);
  const [notReviewedProducts, setNotReviewedProducts] = useState<EligibleProduct[]>([]);
  const [hasPurchases, setHasPurchases] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  useEffect(() => {
    (async () => {
      if (user) {
        const res = await fetch('/api/feed?action=eligible-products', { headers: { 'Authorization': `Bearer ${localStorage.getItem('session_token')||''}` } });
        const j = await res.json();
  // setEligibleProducts(j.products || []);
  setNotReviewedProducts(j.notReviewedProducts || []);
  setHasPurchases(!!j.hasPurchases);
      }
    })();
  }, [user]);
  const createPost = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const res = await feedService.createPost({ title: newPost.title, content: newPost.content, type: newPost.type, imageFile: newPostImage });
      if (res?.success !== false) {
        showToast('Post berhasil dibuat', 'success');
        setNewPost({ title: '', content: '', type: 'post' });
        setNewPostImage(null);
        setNewPostPreview(null);
        setShowCreatePostModal(false);
        load(1);
      } else {
        showToast(res?.error || 'Gagal membuat post', 'error');
      }
    } catch (e: unknown) {
      showToast(getErrorMessage(e, 'Gagal membuat post'), 'error');
    } finally {
      setSubmitting(false);
    }
  };
  const createReview = async () => {
    if (!user) return;
    if (!newReview.product_id) return;
    setSubmitting(true);
    try {
      const res = await feedService.createReview({ title: newReview.title, content: newReview.content, rating: newReview.rating, product_id: newReview.product_id });
      if (res?.success !== false) {
        showToast('Review berhasil dibuat', 'success');
        setNewReview({ title: '', content: '', rating: 5, product_id: '' });
        setShowCreateReviewModal(false);
        load(1);
      } else {
        showToast(res?.error || 'Gagal membuat review', 'error');
      }
    } catch (e: unknown) {
      showToast(getErrorMessage(e, 'Gagal membuat review'), 'error');
    } finally { setSubmitting(false); }
  };

  const toggleLike = async (post: FeedItem) => {
    if (isGuest) return;
    const liked = post.liked_by_me;
    // optimistic update
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, liked_by_me: !liked, likes_count: (p.likes_count || 0) + (liked ? -1 : 1) } : p));
    try {
      if (liked) {
        const r = await feedService.unlike(post.id);
        if (typeof r.likes === 'number') setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes_count: r.likes, liked_by_me: false } : p));
      } else {
        const r = await feedService.like(post.id);
        if (typeof r.likes === 'number') setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes_count: r.likes, liked_by_me: true } : p));
      }
    } catch (e) {
      // revert on error
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, liked_by_me: liked, likes_count: (p.likes_count || 0) + (liked ? 1 : -1) } : p));
    }
  };

  const [commentInputs, setCommentInputs] = useState<Record<string,string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  type FeedComment = { id: string; content: string; created_at: string; parent_comment_id?: string | null; users?: { name?: string; avatar_url?: string; is_admin?: boolean } };
  const [comments, setComments] = useState<Record<string, FeedComment[]>>({});

  const loadComments = async (postId: string) => {
    const { comments } = await feedService.listComments(postId);
    setComments(prev => ({ ...prev, [postId]: comments || [] }));
  };

  const submitComment = async (postId: string, parentId?: string) => {
    if (isGuest) return;
    const content = parentId ? (commentInputs[`reply_${parentId}`] || '') : (commentInputs[postId] || '');
    if (!content.trim()) return;
  const { comments_count } = await feedService.comment(postId, content, parentId);
    setCommentInputs(prev => ({ ...prev, [postId]: '', [`reply_${parentId}`]: '' }));
    await loadComments(postId);
    if (typeof comments_count === 'number') {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count } : p));
    } else {
      // Fallback increment if API didn’t return new count
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p));
    }
  };

  const onClickEdit = (post: FeedItem) => {
    if (post.type === 'review') {
      if (!user || user.id !== post.user_id) return;
      // Allow edit only within 5 minutes since creation (client hint; server should enforce too)
      try {
        const created = new Date(post.created_at).getTime();
        const withinWindow = Date.now() - created <= 5 * 60 * 1000;
        if (!withinWindow) {
          showToast('Review tidak dapat diedit lagi (lebih dari 5 menit)', 'error');
          return;
        }
      } catch {}
      setEditReviewPost(post);
      setEditReviewFields({ title: post.title || '', content: post.content || '', rating: post.rating || 5 });
    } else {
      if (!user || !user.isAdmin) return;
      setEditPostId(post.id);
      setEditFields({ title: post.title || '', content: post.content || '', type: post.type || 'post' });
      setEditPreview(null);
    }
  };
  const onClickDelete = async (post: FeedItem) => {
    if (!user) return;
    if (post.type === 'review') {
      if (!user.isAdmin) return;
    } else {
      if (!user.isAdmin) return;
    }
    if (!confirm('Hapus postingan ini?')) return;
    await feedService.adminDeletePost(post.id);
    load(page);
  };
  const submitEdit = async () => {
    if (!editPostId) return;
    setSubmitting(true);
    try {
      const res = await feedService.adminEditPost(editPostId, editFields);
      if (res?.success !== false) {
        showToast('Post berhasil diperbarui', 'success');
        setEditPostId(null);
        setEditFields({ title: '', content: '', type: 'post' });
        if (editPreview) URL.revokeObjectURL(editPreview);
        setEditPreview(null);
        load(page);
      } else {
        showToast(res?.error || 'Gagal memperbarui post', 'error');
      }
    } catch (e: unknown) {
      showToast(getErrorMessage(e, 'Gagal memperbarui post'), 'error');
    } finally { setSubmitting(false); }
  };
  const submitEditReview = async () => {
    if (!editReviewPost) return;
    setSubmitting(true);
    try {
      const res = await feedService.editReview(editReviewPost.id, editReviewFields);
      if (res?.success !== false) {
        showToast('Review berhasil diperbarui', 'success');
        setEditReviewPost(null);
        setEditReviewFields({ title: '', content: '', rating: 5 });
        load(page);
      } else {
        showToast(res?.error || 'Gagal memperbarui review', 'error');
      }
    } catch (e: unknown) {
      showToast(getErrorMessage(e, 'Gagal memperbarui review'), 'error');
    } finally { setSubmitting(false); }
  };

  // Linkify content
  const linkify = (text: string) => {
    if (!text) return '';
    // Escape HTML to prevent injection
    const escapeHtml = (s: string) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    const escaped = escapeHtml(text);
    const urlRegex = /((https?:\/\/)?([\w-]+\.)+[\w]{2,}(\S*)?)/gi;
    return escaped.replace(urlRegex, (match) => {
      const hasProtocol = match.startsWith('http://') || match.startsWith('https://');
      const href = hasProtocol ? match : `https://${match}`;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-pink-400 underline hover:text-pink-300">${match}</a>`;
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Community Feed</h1>
        <div className="flex items-center gap-2">
          {user && isAdmin && (
            <button onClick={()=>setShowCreatePostModal(true)} className="px-3 py-2 rounded bg-pink-600 hover:bg-pink-500">Buat Post/Announcement</button>
          )}
          {user && hasPurchases && (notReviewedProducts.length > 0) && (
            <button onClick={()=>setShowCreateReviewModal(true)} className="px-3 py-2 rounded border border-white/10 hover:bg-white/5">Buat Review</button>
          )}
        </div>
      </div>
      {/* Filter buttons */}
      <div className="flex items-center gap-2">
        {(['all','announcement','review'] as const).map(t => (
          <button key={t} onClick={()=>{ setFilter(t); setPage(1); }} className={`px-3 py-1 rounded border ${filter===t ? 'border-pink-500 text-pink-400' : 'border-white/10 text-gray-300'} hover:bg-white/5 capitalize`}>
            {t === 'all' ? 'Semua' : t === 'announcement' ? 'Pengumuman' : 'Review'}
          </button>
        ))}
      </div>
      {/* Skeleton while loading */}
      {loading && (
        <div className="space-y-3">
          {Array.from({length: 3}).map((_,i)=> (
            <div key={i} className="border border-white/10 rounded-xl p-4 bg-black/40 animate-pulse">
              <div className="h-4 w-1/3 bg-white/10 rounded" />
              <div className="mt-3 h-6 w-2/3 bg-white/10 rounded" />
              <div className="mt-2 h-20 w-full bg-white/5 rounded" />
            </div>
          ))}
        </div>
      )}
      {!loading && posts.map(post => (
        <div key={post.id} className={`${post.type === 'announcement' ? 'bg-yellow-900/20 border-yellow-400/30' : 'bg-black/50 border-white/10'} border rounded-xl p-4`}>
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center">
                {post.users?.avatar_url ? (
                  <img src={post.users.avatar_url} alt={post.users?.name||'avatar'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm text-white/70">
                    {(post.users?.name||'U').slice(0,1).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-300 flex items-center gap-2">
                  <span className="font-medium text-white">{post.users?.name || 'User'}</span>
                  <RolePill isAdmin={post.users?.is_admin} />
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{new Date(post.created_at).toLocaleString('id-ID')}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {post.type === 'announcement' && <span className="text-[10px] px-2 py-0.5 rounded-full border bg-yellow-500/20 text-yellow-200 border-yellow-400/30">Announcement</span>}
              {user && user.isAdmin && (
                <button onClick={async ()=>{
                  // optimistic pin toggle
                  setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_pinned: !post.is_pinned } : p));
                  try {
                    if (post.is_pinned) { await feedService.unpin(post.id); } else { await feedService.pin(post.id); }
                    // reload to respect ordering
                    load(page);
                  } catch {
                    // revert on error
                    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_pinned: post.is_pinned } : p));
                  }
                }} className={`px-2 py-1 text-xs rounded border ${post.is_pinned ? 'border-green-500 text-green-400' : 'border-white/10 text-gray-300'} hover:bg-white/5`}>{post.is_pinned ? 'Unpin' : 'Pin'}</button>
              )}
              {(user && (
                (post.type === 'review' && user.id === post.user_id && (Date.now() - new Date(post.created_at).getTime() <= 5 * 60 * 1000)) ||
                (post.type !== 'review' && user.isAdmin)
              )) && (
                <div className="flex items-center gap-1">
                  <button title="Edit" className="p-1 rounded hover:bg-white/10" onClick={() => onClickEdit(post)}>
                    ✎
                  </button>
                  {user && user.isAdmin && (
                    <button title="Delete" className="p-1 rounded hover:bg-white/10" onClick={() => onClickDelete(post)}>
                      🗑
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <h3 className="text-lg font-semibold mt-2">{post.title}</h3>
          {post.type === 'review' && <RatingStars value={post.rating} />}
          <p className="text-gray-300 mt-2 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: linkify(post.content) }} />
          {post.type === 'review' && user && user.id === post.user_id && (Date.now() - new Date(post.created_at).getTime() <= 5 * 60 * 1000) && (
            <div className="mt-2 text-xs text-gray-400">Review dapat diedit dalam 5 menit setelah posting</div>
          )}
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
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center mt-0.5">
                        {c.users?.avatar_url ? (
                          <img src={c.users.avatar_url} alt={c.users?.name||'avatar'} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[11px] text-white/70">{(c.users?.name||'U').slice(0,1).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm text-gray-300 flex items-center gap-2">
                          <span className="font-medium text-white">{c.users?.name || 'User'}</span>
                          <RolePill isAdmin={c.users?.is_admin} />
                        </div>
                        <div className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString('id-ID')}</div>
                      </div>
                    </div>
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
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center mt-[2px]">
                            {r.users?.avatar_url ? (
                              <img src={r.users.avatar_url} alt={r.users?.name||'avatar'} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] text-white/70">{(r.users?.name||'U').slice(0,1).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <div className="text-xs text-gray-300 flex items-center gap-2">
                              <span className="text-white">{r.users?.name || 'User'}</span>
                              <RolePill isAdmin={r.users?.is_admin} />
                            </div>
                            <div className="text-[10px] text-gray-500">{new Date(r.created_at).toLocaleString('id-ID')}</div>
                          </div>
                        </div>
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
      <div className="flex items-center justify-center gap-2 pt-2">
        <button disabled={loading || page <= 1} onClick={() => { const p = page - 1; setPage(p); load(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-3 py-1 rounded border border-white/10 disabled:opacity-50 hover:bg-white/5">Prev</button>
        {Array.from({ length: Math.max(1, Math.ceil(total / limit)) }).slice(0, 7).map((_, idx) => {
          const p = idx + 1;
          return (
            <button key={p} onClick={() => { setPage(p); load(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={loading} className={`px-3 py-1 rounded border ${p === page ? 'border-pink-500 text-pink-400' : 'border-white/10 text-gray-300'} hover:bg-white/5`}>
              {p}
            </button>
          );
        })}
        <button disabled={loading || page >= Math.max(1, Math.ceil(total / limit))} onClick={() => { const p = page + 1; setPage(p); load(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-3 py-1 rounded border border-white/10 disabled:opacity-50 hover:bg-white/5">Next</button>
      </div>

      {/* Create Post/Announcement Modal (Admin) */}
      {showCreatePostModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg bg-gradient-to-b from-gray-950 to-black border border-white/10 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Buat Post/Announcement</h3>
              <button onClick={()=>setShowCreatePostModal(false)} className="p-1 rounded hover:bg-white/10">✕</button>
            </div>
            <div className="space-y-3">
              <input autoFocus value={newPost.title} onChange={e=>setNewPost(p=>({...p,title:e.target.value}))} placeholder="Judul" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500/30" />
              <textarea value={newPost.content} onChange={e=>setNewPost(p=>({...p,content:e.target.value}))} placeholder="Konten" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500/30" rows={4} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Gambar</label>
                  <div className="relative w-full aspect-square border border-dashed border-white/15 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
                    {newPostPreview ? (
                      <>
                        <img src={newPostPreview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button type="button" onClick={()=>{ setNewPostImage(null); if (newPostPreview) URL.revokeObjectURL(newPostPreview); setNewPostPreview(null); }} className="text-xs px-2 py-1 border border-white/20 rounded bg-black/40 hover:bg-black/60">Hapus</button>
                        </div>
                      </>
                    ) : (
                      <label className="w-full h-full flex items-center justify-center cursor-pointer text-gray-400 hover:text-white">
                        <input type="file" accept="image/*" className="hidden" onChange={e=>{
                          const f = e.target.files?.[0] || null;
                          setNewPostImage(f);
                          if (newPostPreview) URL.revokeObjectURL(newPostPreview);
                          setNewPostPreview(f ? URL.createObjectURL(f) : null);
                        }} />
                        <span className="text-3xl">＋</span>
                      </label>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Tipe</label>
                  <select value={newPost.type} onChange={e=>setNewPost(p=>({...p, type: e.target.value as 'post'|'announcement'}))} className="w-full bg-black/70 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500/30">
                    <option className="bg-black text-white" value="post">Post</option>
                    <option className="bg-black text-white" value="announcement">Announcement</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 justify-end mt-2">
                <button disabled={submitting} onClick={()=>setShowCreatePostModal(false)} className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50">Batal</button>
                <button disabled={submitting} onClick={createPost} className="px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 disabled:opacity-50">{submitting ? 'Mengirim...' : 'Kirim'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Review Modal (Buyer) */}
      {showCreateReviewModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg bg-gradient-to-b from-gray-950 to-black border border-white/10 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Buat Review</h3>
              <button onClick={()=>setShowCreateReviewModal(false)} className="p-1 rounded hover:bg-white/10">✕</button>
            </div>
            <div className="space-y-3">
              <textarea autoFocus value={newReview.content} onChange={e=>setNewReview(p=>({...p,content:e.target.value}))} placeholder="Bagikan pengalamanmu..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500/30" rows={4} />
              <div>
                <label className="block text-xs text-gray-400 mb-2">Produk</label>
                <select value={newReview.product_id} onChange={e=>setNewReview(p=>({...p,product_id:e.target.value}))} className="w-full bg-black/70 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500/30">
                  <option className="bg-black text-white" value="">Pilih produk yang pernah dibeli</option>
                  {notReviewedProducts.map(p => <option className="bg-black text-white" key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Rating</label>
                <div className="scale-125 origin-left">
                  <RatingSelector value={newReview.rating} onChange={(v)=>setNewReview(p=>({...p, rating: v}))} />
                </div>
              </div>
              <div className="flex items-center gap-2 justify-end mt-2">
                <button disabled={submitting} onClick={()=>setShowCreateReviewModal(false)} className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50">Batal</button>
                <button disabled={submitting} onClick={createReview} className="px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 disabled:opacity-50">{submitting ? 'Mengirim...' : 'Kirim'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editPostId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg bg-gradient-to-b from-gray-950 to-black border border-white/10 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Edit Post</h3>
              <button onClick={()=>{ setEditPostId(null); setEditFields({ title: '', content: '', type: 'post' }); if (editPreview) URL.revokeObjectURL(editPreview); setEditPreview(null); }} className="p-1 rounded hover:bg-white/10">✕</button>
            </div>
            <div className="space-y-3">
              <input value={editFields.title} onChange={e=>setEditFields(p=>({...p,title:e.target.value}))} placeholder="Judul" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500/30" />
              <textarea value={editFields.content} onChange={e=>setEditFields(p=>({...p,content:e.target.value}))} placeholder="Konten" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500/30" rows={4} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Gambar</label>
                  <div className="relative w-full aspect-square border border-dashed border-white/15 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
                    {editPreview ? (
                      <>
                        <img src={editPreview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button type="button" onClick={()=>{ if (editPreview) URL.revokeObjectURL(editPreview); setEditPreview(null); setEditFields(p=>({ ...p, imageFile: undefined })); }} className="text-xs px-2 py-1 border border-white/20 rounded bg-black/40 hover:bg-black/60">Bersihkan</button>
                        </div>
                      </>
                    ) : (
                      // Show existing image when available and not marked for removal
                      (() => {
                        const existing = posts.find(p => p.id === editPostId)?.image_url;
                        if (existing && !editFields.removeImage) {
                          return (
                            <>
                              <img src={existing} alt="current" className="absolute inset-0 w-full h-full object-cover" />
                              <div className="absolute top-2 right-2 flex gap-2">
                                <button type="button" onClick={()=> setEditFields(p=>({ ...p, removeImage: true }))} className="text-xs px-2 py-1 border border-white/20 rounded bg-black/40 hover:bg-black/60">Hapus</button>
                              </div>
                            </>
                          );
                        }
                        return (
                          <label className="w-full h-full flex items-center justify-center cursor-pointer text-gray-400 hover:text-white">
                            <input type="file" accept="image/*" className="hidden" onChange={e=>{
                              const f = e.target.files?.[0] || null;
                              setEditFields(p=>({ ...p, imageFile: f, removeImage: false }));
                              if (editPreview) URL.revokeObjectURL(editPreview);
                              setEditPreview(f ? URL.createObjectURL(f) : null);
                            }} />
                            <span className="text-3xl">＋</span>
                          </label>
                        );
                      })()
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Tipe</label>
                  <select value={editFields.type} onChange={e=>setEditFields(p=>({...p, type: e.target.value as 'post'|'announcement'}))} className="w-full bg-black/70 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500/30">
                    <option className="bg-black text-white" value="post">Post</option>
                    <option className="bg-black text-white" value="announcement">Announcement</option>
                  </select>
                  <div className="mt-2 text-xs text-gray-400">
                    Pilih gambar baru untuk mengganti, atau centang hapus pada gambar yang ada.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 justify-end mt-2">
                <button onClick={()=>{ setEditPostId(null); setEditFields({ title: '', content: '', type: 'post' }); if (editPreview) URL.revokeObjectURL(editPreview); setEditPreview(null); }} className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5">Batal</button>
                <button onClick={submitEdit} className="px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-500">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {editReviewPost && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg bg-gradient-to-b from-gray-950 to-black border border-white/10 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Edit Review</h3>
              <button onClick={()=>{ setEditReviewPost(null); setEditReviewFields({ title: '', content: '', rating: 5 }); }} className="p-1 rounded hover:bg-white/10">✕</button>
            </div>
            <div className="space-y-3">
              <input value={editReviewFields.title} onChange={e=>setEditReviewFields(p=>({...p,title:e.target.value}))} placeholder="Judul" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500/30" />
              <textarea value={editReviewFields.content} onChange={e=>setEditReviewFields(p=>({...p,content:e.target.value}))} placeholder="Konten" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500/30" rows={4} />
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Rating:</span>
                <RatingSelector value={editReviewFields.rating} onChange={(v)=>setEditReviewFields(p=>({...p, rating: v}))} />
              </div>
              <div className="flex items-center gap-2 justify-end mt-2">
                <button onClick={()=>{ setEditReviewPost(null); setEditReviewFields({ title: '', content: '', rating: 5 }); }} className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5">Batal</button>
                <button onClick={submitEditReview} className="px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-500">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedPage;
