import React, { useEffect, useState } from 'react';
import { Banner } from '../../types';
import { BannerService } from '../../services/bannerService';
import { Plus, Trash2, Save, Edit3, Image as ImageIcon, Link as LinkIcon, Loader2 } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-floating-promises */

const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState<{ title: string; subtitle?: string; linkUrl?: string; ctaText?: string; sortOrder: number; isActive: boolean; file: File | null }>(
    { title: '', subtitle: '', linkUrl: '', ctaText: '', sortOrder: 1, isActive: true, file: null }
  );
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => { (async () => { setLoading(true); setBanners(await BannerService.list()); setLoading(false); })(); }, []);

  const resetForm = () => { setForm({ title: '', subtitle: '', linkUrl: '', ctaText: '', sortOrder: 1, isActive: true, file: null }); setPreviewUrl(''); };

  const startCreate = () => { setEditing(null); resetForm(); };

  const startEdit = (b: Banner) => {
    setEditing(b);
  setForm({ title: b.title, subtitle: b.subtitle, linkUrl: b.linkUrl, ctaText: b.ctaText, sortOrder: b.sortOrder, isActive: b.isActive, file: null });
    setPreviewUrl(b.imageUrl || '');
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setForm(prev => ({ ...prev, file: f }));
    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    }
  };

  const save = async () => {
    if (!form.title || !form.file && !editing) return alert('Judul dan Gambar wajib diisi');
    if (editing) {
  const updated = await BannerService.update(editing.id, { ...editing, ...form });
      if (updated) {
        setBanners(prev => prev.map(b => b.id === updated.id ? updated : b));
        setEditing(null); resetForm();
      }
    } else {
      const created = await BannerService.create({
        title: form.title,
        subtitle: form.subtitle,
        imageUrl: '',
        linkUrl: form.linkUrl,
        ctaText: form.ctaText,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
        file: form.file,
      });
      if (created) {
        setBanners(prev => [...prev, created].sort((a,b)=>a.sortOrder-b.sortOrder));
        resetForm();
      }
    }
  };

  const remove = async (b: Banner) => {
    if (!confirm('Hapus banner ini?')) return;
    const ok = await BannerService.remove(b.id, b.imageUrl);
    if (ok) setBanners(prev => prev.filter(x => x.id !== b.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Kelola Banner</h1>
        <button onClick={startCreate} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-700">
          <Plus size={16} /> Banner Baru
        </button>
      </div>

      {/* Form */}
  <div className="bg-black/40 border border-pink-500/20 rounded-xl p-4 space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-400">Judul</label>
            <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} className="w-full mt-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-gray-400">Subjudul</label>
            <input value={form.subtitle||''} onChange={e=>setForm(p=>({...p,subtitle:e.target.value}))} className="w-full mt-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-gray-400">CTA Text (opsional)</label>
            <input value={form.ctaText||''} onChange={e=>setForm(p=>({...p,ctaText:e.target.value}))} className="w-full mt-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2" placeholder="Contoh: Lihat, Beli Sekarang, Pelajari" />
          </div>
          <div>
            <label className="text-sm text-gray-400">Link</label>
            <div className="flex items-center gap-2 mt-1">
              <LinkIcon size={16} className="text-gray-400" />
              <input value={form.linkUrl||''} onChange={e=>setForm(p=>({...p,linkUrl:e.target.value}))} className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2" placeholder="/flash-sales atau https://..." />
            </div>
          </div>
          <div className="grid grid-cols-[1fr_auto] items-end gap-2">
            <div>
              <label className="text-sm text-gray-400">Urutan</label>
              <input type="number" value={form.sortOrder} onChange={e=>setForm(p=>({...p,sortOrder:parseInt(e.target.value||'1',10)}))} className="w-full mt-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2" />
            </div>
            <div className="flex items-center gap-2">
              <input id="isActive" type="checkbox" checked={form.isActive} onChange={e=>setForm(p=>({...p,isActive:e.target.checked}))} />
              <label htmlFor="isActive" className="text-sm text-gray-300">Aktif</label>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gray-400">Gambar</label>
            <div className="mt-1 flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer">
                <ImageIcon size={16} /> Pilih File
                <input type="file" className="hidden" accept="image/*" onChange={onFile} />
              </label>
              <span className="text-xs text-gray-400">{form.file?.name || (editing ? 'Biarkan kosong jika tidak diubah' : 'Belum ada file')}</span>
              {previewUrl && (
                <img src={previewUrl} alt="preview" className="h-14 rounded border border-white/10" />
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700">
            <Save size={16} /> Simpan
          </button>
          {editing && (
            <button onClick={()=>{setEditing(null); resetForm();}} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-600 hover:bg-gray-700">
              Batal
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="bg-black/40 border border-pink-500/20 rounded-xl p-4">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-400"><Loader2 className="animate-spin" size={18} /> Memuat...</div>
        ) : banners.length === 0 ? (
          <div className="text-gray-400">Belum ada banner</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map(b => (
              <div key={b.id} className="rounded-xl overflow-hidden border border-white/10 bg-white/5">
                <img src={b.imageUrl} alt={b.title} className="w-full h-36 object-cover" />
                <div className="p-3">
                  <div className="font-semibold">{b.title}</div>
                  {b.subtitle && <div className="text-sm text-gray-400">{b.subtitle}</div>}
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                    <span>Urutan: {b.sortOrder}</span>
                    <span>{b.isActive ? 'Aktif' : 'Nonaktif'}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={()=>startEdit(b)} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs"><Edit3 size={14}/> Edit</button>
                    <button onClick={()=>remove(b)} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-600/80 hover:bg-rose-700 text-xs text-white"><Trash2 size={14}/> Hapus</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBanners;
