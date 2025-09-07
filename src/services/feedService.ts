import { supabase } from './supabase.ts';

async function toBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buf);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function uploadImageViaApi(file: File, folder = 'feed'): Promise<string | undefined> {
  const body = {
    name: file.name,
    contentType: file.type || 'application/octet-stream',
    dataBase64: await toBase64(file),
    folder
  };
  const res = await fetch('/api/feed?action=upload-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}` },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (data?.publicUrl) return data.publicUrl as string;
  return undefined;
}

export const feedService = {
  async list(page = 1, limit = 10) {
    const res = await fetch(`/api/feed?action=list&page=${page}&limit=${limit}`);
    return res.json();
  },
  async createPost(payload: { title: string; content: string; imageFile?: File | null; type?: 'post'|'announcement' }) {
    let image_url: string | undefined;
    if (payload.imageFile) {
  const u = await uploadImageViaApi(payload.imageFile, 'feed');
      image_url = u || undefined;
    }
    const res = await fetch('/api/feed?action=create-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}` },
      body: JSON.stringify({ title: payload.title, content: payload.content, image_url, type: payload.type })
    });
    return res.json();
  },
  async createReview(payload: { title: string; rating: number; content: string; product_id: string }) {
    const res = await fetch('/api/feed?action=create-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}` },
      body: JSON.stringify({ ...payload })
    });
    return res.json();
  },
  async adminEditPost(post_id: string, fields: { title?: string; content?: string; type?: 'post'|'announcement'; imageFile?: File | null; removeImage?: boolean }) {
    let image_url: string | undefined;
    if (fields.imageFile) {
  const u = await uploadImageViaApi(fields.imageFile, 'feed');
      image_url = u || undefined;
    }
    if (!fields.imageFile && fields.removeImage) {
      image_url = '';
    }
    const res = await fetch('/api/feed?action=admin-edit-post', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}` },
      body: JSON.stringify({ post_id, ...fields, image_url })
    });
    return res.json();
  },
  async adminDeletePost(post_id: string) {
    const res = await fetch(`/api/feed?action=admin-delete-post&post_id=${post_id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}` }
    });
    return res.json();
  },
  async like(post_id: string) {
    const res = await fetch('/api/feed?action=like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}` },
      body: JSON.stringify({ post_id })
    });
    return res.json();
  },
  async unlike(post_id: string) {
    const res = await fetch('/api/feed?action=unlike', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}` },
      body: JSON.stringify({ post_id })
    });
    return res.json();
  },
  async comment(post_id: string, content: string, parent_comment_id?: string) {
    const res = await fetch('/api/feed?action=comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}` },
      body: JSON.stringify({ post_id, content, parent_comment_id })
    });
    return res.json();
  },
  async listComments(post_id: string) {
    const res = await fetch(`/api/feed?action=comments&post_id=${post_id}`);
    return res.json();
  },
  async editReview(post_id: string, fields: { title?: string; content?: string; rating?: number; imageFile?: File | null }) {
    let image_url: string | undefined;
    if (fields.imageFile) {
  const u = await uploadImageViaApi(fields.imageFile, 'feed');
      image_url = u || undefined;
    }
    const res = await fetch('/api/feed?action=edit-review', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}` },
      body: JSON.stringify({ post_id, ...fields, image_url })
    });
    return res.json();
  },
  async adminDeleteComment(comment_id: string) {
    const res = await fetch(`/api/feed?action=admin-delete-comment&comment_id=${comment_id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}` }
    });
    return res.json();
  },
  async getNotifications() {
    const res = await fetch('/api/feed?action=notifications', { headers: { 'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}` } });
    return res.json();
  },
  async markNotificationsRead() {
    const res = await fetch('/api/feed?action=notifications-read', { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}` } });
    return res.json();
  }
};
