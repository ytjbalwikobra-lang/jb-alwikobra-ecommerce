import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase.ts';
import { getAuthUserId } from '../../services/authService.ts';
import { useToast } from '../../components/Toast.tsx';

type ProfileRow = { id: string; name: string | null; role: string; email?: string | null };

const AdminUsers: React.FC = () => {
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);
  const { push } = useToast();

  const load = async () => {
    try {
      if (!supabase) return;
      const { data: profs } = await (supabase as any).from('profiles').select('id, name, role');
      const ids = (profs || []).map((p: any) => p.id);
      // Fetch emails from auth via admin API isn't available client-side; skip or map from session user when available.
      setRows(profs || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { (async()=>{ setUid(await getAuthUserId()); await load(); })(); }, []);

  const updateRole = async (id: string, role: string) => {
    if (!supabase) return;
    // Prevent demoting the last admin (including 'super admin'/'owner')
    const normalized = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ');
    const adminSet = new Set(['admin','superadmin','super-admin','super admin','owner']);
    const isAdminRole = (r: string) => adminSet.has(normalized(r));
    const current = rows.find(r=>r.id===id);
    if (current && isAdminRole(current.role) && !isAdminRole(role)) {
      const adminCount = rows.filter(r=>isAdminRole(r.role)).length;
      if (adminCount <= 1 && uid === id) {
        alert('Tidak bisa menurunkan peran: ini adalah admin terakhir. Tambahkan admin lain terlebih dahulu.');
        return;
      }
    }
  const { error } = await (supabase as any).from('profiles').update({ role }).eq('id', id);
  if (error) push('Gagal memperbarui peran', 'error');
  else push('Peran diperbarui', 'success');
  await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users & Roles</h1>
          <p className="text-gray-400">Kelola peran pengguna</p>
        </div>
      </div>

      <div className="bg-black/60 border border-pink-500/30 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 text-xs uppercase text-gray-400 px-4 py-2 border-b border-pink-500/20">
          <div className="col-span-6">Nama</div>
          <div className="col-span-3">Role</div>
          <div className="col-span-3 text-right">Aksi</div>
        </div>
        {loading ? (
          <div className="p-4 text-gray-400">Memuat…</div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-gray-400">Belum ada data.</div>
        ) : rows.map((r) => (
          <div key={r.id} className="grid grid-cols-12 items-center px-4 py-3 border-b border-pink-500/10">
            <div className="col-span-6 text-white">{r.name || r.id}</div>
            <div className="col-span-3 text-gray-300">{r.role}</div>
            <div className="col-span-3 text-right">
              <select
                value={r.role}
                onChange={(e)=>updateRole(r.id, e.target.value)}
                className="bg-black border border-white/20 rounded px-2 py-1 text-white"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
                <option value="super admin">super admin</option>
                <option value="owner">owner</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;
