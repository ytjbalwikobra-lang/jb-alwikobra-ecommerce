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

const FeedPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const isGuest = !user;
  const isAdmin = !!user?.isAdmin;

  // Modal state
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showCreateReviewModal, setShowCreateReviewModal] = useState(false);
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<{ title: string; content: string; type: 'post'|'announcement'; imageFile?: File | null; removeImage?: boolean }>({ title: '', content: '', type: 'post' });
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [editReviewPost, setEditReviewPost] = useState<any | null>(null);
  const [editReviewFields, setEditReviewFields] = useState<{ title: string; content: string; rating: number }>({ title: '', content: '', rating: 5 });

  const load = async (p = 1) => {
    setLoading(true);
    const { data, total } = await feedService.list(p, limit);
    setPosts(data || []);
    setTotal(total || 0);
    setLoading(false);
  };

  useEffect(() => { load(1); /* eslint-disable-next-line */ }, []);

  // Create bars
  const [newPost, setNewPost] = useState<{title:string;content:string;type:'post'|'announcement'}>({ title: '', content: '', type: 'post' });
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [newPostPreview, setNewPostPreview] = useState<string | null>(null);
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
  await feedService.createPost({ title: newPost.title, content: newPost.content, type: newPost.type, imageFile: newPostImage });
  setNewPost({ title: '', content: '', type: 'post' });
  setNewPostImage(null);
  setNewPostPreview(null);
  setShowCreatePostModal(false);
  load(1);
  };
  const createReview = async () => {
    if (!user) return;
    if (!newReview.product_id) return;
  await feedService.createReview({ title: newReview.title, content: newReview.content, rating: newReview.rating, product_id: newReview.product_id });
  setNewReview({ title: '', content: '', rating: 5, product_id: '' });
  setShowCreateReviewModal(false);
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
    const { comment, comments_count } = await feedService.comment(postId, content, parentId);
    setCommentInputs(prev => ({ ...prev, [postId]: '', [`reply_${parentId}`]: '' }));
    await loadComments(postId);
    if (typeof comments_count === 'number') {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count } : p));
    } else {
      // Fallback increment if API didn’t return new count
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p));
    }
  };

  const onClickEdit = (post: any) => {
    if (post.type === 'review') {
      if (!user || user.id !== post.user_id) return;
      setEditReviewPost(post);
      setEditReviewFields({ title: post.title || '', content: post.content || '', rating: post.rating || 5 });
    } else {
      if (!user || !user.isAdmin) return;
      setEditPostId(post.id);
      setEditFields({ title: post.title || '', content: post.content || '', type: post.type || 'post' });
      setEditPreview(null);
    }
  };
  const onClickDelete = async (post: any) => {
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
    await feedService.adminEditPost(editPostId, editFields);
    setEditPostId(null);
    setEditFields({ title: '', content: '', type: 'post' });
    if (editPreview) URL.revokeObjectURL(editPreview);
    setEditPreview(null);
    load(page);
  };
  const submitEditReview = async () => {
    if (!editReviewPost) return;
    await feedService.editReview(editReviewPost.id, editReviewFields);
    setEditReviewPost(null);
    setEditReviewFields({ title: '', content: '', rating: 5 });
    load(page);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Community Feed</h1>
      <div className="flex items-center gap-2">
        {user && isAdmin && (
          <button onClick={()=>setShowCreatePostModal(true)} className="px-3 py-2 rounded bg-pink-600 hover:bg-pink-500">Buat Post/Announcement</button>
        )}
        {user && (
          <button onClick={()=>setShowCreateReviewModal(true)} className="px-3 py-2 rounded border border-white/10 hover:bg-white/5">Buat Review</button>
        )}
      </div>
      {posts.map(post => (
        <div key={post.id} className={`${post.type === 'announcement' ? 'bg-yellow-900/20 border-yellow-400/30' : 'bg-black/50 border-white/10'} border rounded-xl p-4`}>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <span>{post.users?.name || 'User'}</span>
              <RolePill isAdmin={post.users?.is_admin} />
              <span>· {new Date(post.created_at).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex items-center gap-2">
              {post.type === 'announcement' && <span className="text-[10px] px-2 py-0.5 rounded-full border bg-yellow-500/20 text-yellow-200 border-yellow-400/30">Announcement</span>}
              {(user && (
                (post.type === 'review' && user.id === post.user_id) ||
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
                    <div className="text-sm text-gray-400 flex items-center gap-2">
                      <span>{c.users?.name || 'User'}</span>
                      <RolePill isAdmin={c.users?.is_admin} />
                      <span>· {new Date(c.created_at).toLocaleString('id-ID')}</span>
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
                        <div className="text-xs text-gray-400 flex items-center gap-2">
                          <span>{r.users?.name || 'User'}</span>
                          <RolePill isAdmin={r.users?.is_admin} />
                          <span>· {new Date(r.created_at).toLocaleString('id-ID')}</span>
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
              <div className="flex items-start gap-3">
                <div>
                  <label className="text-xs text-gray-400">Gambar:
                    <input type="file" accept="image/*" className="block text-sm mt-1" onChange={e=>{
                      const f = e.target.files?.[0] || null;
                      setNewPostImage(f);
                      if (newPostPreview) URL.revokeObjectURL(newPostPreview);
                      setNewPostPreview(f ? URL.createObjectURL(f) : null);
                    }} />
                  </label>
                </div>
                {newPostPreview && (
                  <div className="flex items-center gap-2">
                    <img src={newPostPreview} alt="preview" className="w-24 h-24 object-cover rounded-lg border border-white/10" />
                    <button type="button" onClick={()=>{ setNewPostImage(null); if (newPostPreview) URL.revokeObjectURL(newPostPreview); setNewPostPreview(null); }} className="text-xs px-2 py-1 border border-white/10 rounded hover:bg-white/10">Hapus</button>
                  </div>
                )}
                <select value={newPost.type} onChange={e=>setNewPost(p=>({...p, type: e.target.value as any}))} className="bg-white/5 border border-white/10 rounded px-2 py-1">
                  <option value="post">post</option>
                  <option value="announcement">announcement</option>
                </select>
              </div>
              <div className="flex items-center gap-2 justify-end mt-2">
                <button onClick={()=>setShowCreatePostModal(false)} className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5">Batal</button>
                <button onClick={createPost} className="px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-500">Kirim</button>
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
              <input autoFocus value={newReview.title} onChange={e=>setNewReview(p=>({...p,title:e.target.value}))} placeholder="Judul" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500/30" />
              <textarea value={newReview.content} onChange={e=>setNewReview(p=>({...p,content:e.target.value}))} placeholder="Konten" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500/30" rows={4} />
              <div className="flex items-center gap-2">
                <select value={newReview.product_id} onChange={e=>setNewReview(p=>({...p,product_id:e.target.value}))} className="bg-white/5 border border-white/10 rounded px-2 py-1">
                  <option value="">Pilih produk yang pernah dibeli</option>
                  {eligibleProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <RatingSelector value={newReview.rating} onChange={(v)=>setNewReview(p=>({...p, rating: v}))} />
              </div>
              <div className="flex items-center gap-2 justify-end mt-2">
                <button onClick={()=>setShowCreateReviewModal(false)} className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5">Batal</button>
                <button onClick={createReview} className="px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-500">Kirim</button>
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
              <div className="flex items-start gap-3">
                <select value={editFields.type} onChange={e=>setEditFields(p=>({...p, type: e.target.value as any}))} className="bg-white/5 border border-white/10 rounded px-2 py-1">
                  <option value="post">post</option>
                  <option value="announcement">announcement</option>
                </select>
                <div>
                  <label className="text-xs text-gray-400">Gambar:
                    <input type="file" accept="image/*" className="block text-sm mt-1" onChange={e=>{
                      const f = e.target.files?.[0] || null;
                      setEditFields(p=>({ ...p, imageFile: f, removeImage: false }));
                      if (editPreview) URL.revokeObjectURL(editPreview);
                      setEditPreview(f ? URL.createObjectURL(f) : null);
                    }} />
                  </label>
                  <div className="mt-1">
                    <label className="inline-flex items-center gap-2 text-xs text-gray-400">
                      <input type="checkbox" checked={!!editFields.removeImage} onChange={e=>setEditFields(p=>({ ...p, removeImage: e.target.checked, imageFile: e.target.checked ? undefined : p.imageFile }))} /> Hapus gambar
                    </label>
                  </div>
                </div>
                {editPreview && (
                  <div className="flex items-center gap-2">
                    <img src={editPreview} alt="preview" className="w-24 h-24 object-cover rounded-lg border border-white/10" />
                    <button type="button" onClick={()=>{ if (editPreview) URL.revokeObjectURL(editPreview); setEditPreview(null); setEditFields(p=>({ ...p, imageFile: undefined })); }} className="text-xs px-2 py-1 border border-white/10 rounded hover:bg-white/10">Bersihkan</button>
                  </div>
                )}
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
