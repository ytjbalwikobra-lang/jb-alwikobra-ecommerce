import React, { useEffect, useMemo, useState } from 'react';
import { GameTitle } from '../../types/index.ts';
import { ProductService } from '../../services/productService.ts';
import { supabase } from '../../services/supabase.ts';
import { useToast } from '../../components/Toast.tsx';
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';

type FormState = {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  logo_url?: string;
  is_active: boolean;
  sort_order?: number;
};

const emptyForm: FormState = {
  name: '',
  slug: '',
  description: '',
  icon: 'Zap',
  color: '#f472b6',
  logo_url: '',
  is_active: true,
  sort_order: 0,
};

const AdminGameTitles: React.FC = () => {
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<GameTitle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const list = await ProductService.getGameTitles();
      setItems(list);
    } catch (e: any) {
      push(`Gagal memuat Game Titles: ${e?.message || e}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startCreate = () => { setForm(emptyForm); setShowForm(true); };
  const startEdit = (gt: GameTitle) => {
    setForm({
      id: gt.id,
      name: gt.name,
      slug: gt.slug,
      description: gt.description || '',
      icon: gt.icon || 'Zap',
      color: gt.color || '#f472b6',
      logo_url: gt.logoUrl || '',
      is_active: gt.isActive !== false,
      sort_order: gt.sortOrder || 0,
    });
    setShowForm(true);
  };

  const cancelForm = () => { setShowForm(false); setForm(emptyForm); };

  const toDbPayload = (f: FormState) => ({
    name: f.name.trim(),
    slug: f.slug.trim().toLowerCase().replace(/\s+/g,'-'),
    description: f.description?.trim() || null,
    icon: f.icon || null,
    color: f.color || null,
    logo_url: f.logo_url || null,
    is_active: !!f.is_active,
    sort_order: Number(f.sort_order || 0),
  });

  const save = async () => {
    if (!supabase) { push('Supabase belum dikonfigurasi.', 'error'); return; }
    if (!form.name || !form.slug) { push('Nama dan slug wajib diisi', 'error'); return; }
    setSaving(true);
    try {
      if (!form.id) {
        const { error } = await (supabase as any).from('game_titles').insert(toDbPayload(form));
        if (error) throw error;
        push('Game title ditambahkan', 'success');
      } else {
        const { error } = await (supabase as any).from('game_titles').update(toDbPayload(form)).eq('id', form.id);
        if (error) throw error;
        push('Game title diperbarui', 'success');
      }
      setShowForm(false);
      await load();
    } catch (e: any) {
      push(`Gagal menyimpan: ${e?.message || e}`, 'error');
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!supabase) return;
    if (!confirm('Hapus game title ini?')) return;
    try {
      const { error } = await (supabase as any).from('game_titles').delete().eq('id', id);
      if (error) throw error;
      push('Game title dihapus', 'success');
      await load();
    } catch (e: any) {
      push(`Gagal menghapus: ${e?.message || e}`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Game Titles</h1>
          <p className="text-gray-400">Kelola daftar game yang tampil di katalog, jual akun, dan filter.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm"><RefreshCw size={16}/> Refresh</button>
          <button onClick={startCreate} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-sm"><Plus size={16}/> Tambah</button>
        </div>
      </div>

      {/* List */}
      <div className="bg-black/60 border border-pink-500/30 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 text-xs uppercase text-gray-400 px-4 py-2 border-b border-pink-500/20">
          <div className="col-span-4">Nama</div>
          <div className="col-span-3">Slug</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3 text-right">Aksi</div>
        </div>
        {loading ? (
          <div className="p-4 text-gray-400">Memuat…</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-gray-400">Belum ada data.</div>
        ) : items.map(gt => (
          <div key={gt.id} className="grid grid-cols-12 items-center px-4 py-3 border-b border-pink-500/10">
            <div className="col-span-4 text-white">
              <div className="font-medium flex items-center gap-2">
                {gt.logoUrl ? (
                  <img src={gt.logoUrl} alt={gt.name} className="w-6 h-6 rounded"/>
                ) : (
                  <div className="w-6 h-6 rounded bg-white/10 border border-white/20" />
                )}
                <span>{gt.name}</span>
              </div>
              {gt.description && <div className="text-xs text-gray-400 line-clamp-1">{gt.description}</div>}
            </div>
            <div className="col-span-3 text-gray-300">{gt.slug}</div>
            <div className="col-span-2 text-gray-300">{gt.isActive ? 'Aktif' : 'Nonaktif'}</div>
            <div className="col-span-3 text-right">
              <button className="inline-flex items-center gap-1 text-xs px-2 py-1 border border-white/20 rounded text-white hover:bg-white/5 mr-2" onClick={()=>startEdit(gt)}><Pencil size={14}/> Edit</button>
              <button className="inline-flex items-center gap-1 text-xs px-2 py-1 border border-red-500/40 text-red-300 rounded hover:bg-red-500/10" onClick={()=>remove(gt.id)}><Trash2 size={14}/> Hapus</button>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-black/60 border border-pink-500/30 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white mb-3">{form.id ? 'Edit' : 'Tambah'} Game Title</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nama</label>
              <input value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white" placeholder="Mobile Legends"/>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Slug</label>
              <input value={form.slug} onChange={e=>setForm({...form, slug: e.target.value})} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white" placeholder="mobile-legends"/>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Deskripsi</label>
              <input value={form.description} onChange={e=>setForm({...form, description: e.target.value})} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white" placeholder="Deskripsi singkat"/>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Icon (lucide)</label>
              <input value={form.icon} onChange={e=>setForm({...form, icon: e.target.value})} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white" placeholder="Zap"/>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Warna</label>
              <input value={form.color} onChange={e=>setForm({...form, color: e.target.value})} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white" placeholder="#f472b6"/>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Logo URL</label>
              <input value={form.logo_url} onChange={e=>setForm({...form, logo_url: e.target.value})} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white" placeholder="https://..."/>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Urutan</label>
              <input type="number" value={form.sort_order} onChange={e=>setForm({...form, sort_order: Number(e.target.value)})} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white"/>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Status</label>
              <select value={form.is_active ? '1' : '0'} onChange={e=>setForm({...form, is_active: e.target.value==='1'})} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white">
                <option value="1">Aktif</option>
                <option value="0">Nonaktif</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button onClick={cancelForm} className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10">Batal</button>
            <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-60">{saving ? 'Menyimpan…' : 'Simpan'}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGameTitles;
