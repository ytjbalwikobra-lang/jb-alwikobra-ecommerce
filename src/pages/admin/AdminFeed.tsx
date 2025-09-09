import React, { useEffect, useState } from 'react';
import { feedService } from '../../services/feedService';

const AdminFeed: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await feedService.list(1, 50);
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const del = async (postId: string) => {
    if (!confirm('Hapus post ini?')) return;
    await feedService.adminDeletePost(postId);
    await load();
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Moderasi Feed</h1>
      {loading && <div className="text-gray-400">Loading...</div>}
      {(posts || []).map(p => (
        <div key={p.id} className="bg-black/50 border border-white/10 rounded p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">{p.users?.name || 'User'} · {new Date(p.created_at).toLocaleString('id-ID')}</div>
              <div className="font-semibold">{p.title}</div>
            </div>
            <button onClick={() => del(p.id)} className="px-3 py-1 text-sm border border-red-500/40 text-red-400 rounded hover:bg-red-500/10">Hapus</button>
          </div>
          <div className="text-gray-300 mt-2">{p.content}</div>
        </div>
      ))}
    </div>
  );
};

export default AdminFeed;
