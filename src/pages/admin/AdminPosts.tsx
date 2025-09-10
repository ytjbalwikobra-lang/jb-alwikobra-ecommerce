import React from 'react';
import { useAuth } from '../../contexts/TraditionalAuthContext';
import { supabase } from '../../services/supabase';

const AdminPosts: React.FC = () => {
  const { user } = useAuth();
  const [content, setContent] = React.useState('');
  const [files, setFiles] = React.useState<FileList | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return setMessage('Supabase belum siap.');
    setSubmitting(true);
    setMessage(null);
    try {
      // Create post
      const { data: post, error } = await supabase
        .from('posts')
        .insert({ content, author_id: user?.id })
        .select('*')
        .single();
      if (error) throw error;

      // Upload media URLs if any (expecting external URLs or using Storage upload elsewhere)
      if (files && files.length) {
        // Simplest path: use object URLs as placeholders or assume pre-uploaded URLs entered into content.
        // For production, integrate Supabase Storage upload and use returned public URLs.
        const mediaRows = Array.from(files).map((f, i) => ({ post_id: post.id, type: f.type.startsWith('video') ? 'video' : 'image', url: URL.createObjectURL(f), position: i }));
        const { error: mErr } = await supabase.from('post_media').insert(mediaRows);
        if (mErr) throw mErr;
      }

      setMessage('Post berhasil dibuat');
      setContent('');
      (document.getElementById('files') as HTMLInputElement | null)?.value && ((document.getElementById('files') as HTMLInputElement).value = '');
      setFiles(null);
    } catch (err: any) {
      setMessage(err.message || 'Gagal membuat post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Posts</h1>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-xl">
        <textarea
          className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-sm"
          rows={4}
          placeholder="Tulis konten..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <input id="files" type="file" multiple onChange={(e) => setFiles(e.target.files)} className="text-sm" />
        <button disabled={submitting} className="px-4 py-2 rounded-lg bg-pink-600 text-white disabled:opacity-60">
          {submitting ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
      {message && <p className="mt-3 text-sm text-gray-300">{message}</p>}
    </div>
  );
};

export default AdminPosts;
