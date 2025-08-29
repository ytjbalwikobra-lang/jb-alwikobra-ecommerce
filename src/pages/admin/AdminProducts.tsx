import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product, Tier, GameTitle } from '../../types/index.ts';
import { ProductService } from '../../services/productService.ts';
import { supabase } from '../../services/supabase.ts';
import ImageUploader from '../../components/ImageUploader.tsx';
import { uploadFiles } from '../../services/storageService.ts';
import { useToast } from '../../components/Toast.tsx';

type FormState = {
  id?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  gameTitleId?: string;
  tierId?: string;
  accountLevel?: string;
  accountDetails?: string;
  images: string[];
  rentals: { id?: string; duration: string; price: number; description?: string }[];
};

const emptyForm: FormState = {
  name: '',
  description: '',
  price: 0,
  originalPrice: 0,
  gameTitleId: '',
  tierId: '',
  accountLevel: '',
  accountDetails: '',
  images: [],
  rentals: [],
};

const AdminProducts: React.FC = () => {
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [games, setGames] = useState<GameTitle[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [list, tList, gList] = await Promise.all([
          ProductService.getAllProducts(),
          ProductService.getTiers(),
          ProductService.getGameTitles(),
        ]);
        setProducts(list);
        setTiers(tList);
        setGames(gList);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const startCreate = () => {
    setForm(emptyForm);
    setShowForm(true);
  };

  const startEdit = (p: Product) => {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice,
      gameTitleId: p.gameTitleData?.id || p.gameTitleId || '',
      tierId: p.tierData?.id || p.tierId || '',
      accountLevel: p.accountLevel,
      accountDetails: p.accountDetails,
      images: p.images && p.images.length ? p.images : (p.image ? [p.image] : []),
      rentals: (p.rentalOptions || []).map(r=>({ id: r.id, duration: r.duration, price: r.price, description: r.description }))
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Basic payload mapping; in real DB schema, tier/gameTitle should use FKs
      const primaryImage = form.images[0] || '';
  const payload: any = {
        name: form.name,
        description: form.description,
        price: Number(form.price) || 0,
        original_price: Number(form.originalPrice) || 0,
        image: primaryImage,
        images: form.images,
        game_title_id: form.gameTitleId || null,
        tier_id: form.tierId || null,
        account_level: form.accountLevel,
        account_details: form.accountDetails,
        is_flash_sale: false,
        has_rental: (form.rentals?.length || 0) > 0,
        stock: 1,
      };

      let saved: Product | null = null;
      const isUuid = (v?: string) => !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
      const canUpdate = form.id && isUuid(form.id);
      if (canUpdate) {
        saved = await ProductService.updateProduct(form.id!, payload as any);
      } else {
        if (form.id && !isUuid(form.id)) {
          push('Produk contoh tidak bisa diubah, membuat salinan baru...', 'info');
        }
        saved = await ProductService.createProduct(payload as any);
      }

      if (saved) {
        // Save rentals if provided (simple implementation: delete and recreate)
        if (form.rentals?.length && supabase) {
          try {
            const productId = saved.id;
            if (canUpdate) {
              await supabase.from('rental_options').delete().eq('product_id', productId);
            }
            const inserts = form.rentals.map(r=>({ product_id: productId, duration: r.duration, price: Number(r.price)||0, description: r.description || null }));
            if (inserts.length) await supabase.from('rental_options').insert(inserts);
          } catch {}
        }
        const updated = await ProductService.getAllProducts();
        setProducts(updated);
        setShowForm(false);
        setForm(emptyForm);
        push('Produk disimpan', 'success');
      } else {
        push('Gagal menyimpan produk', 'error');
      }
    } catch (e: any) {
      push(`Error: ${e?.message || e}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus produk ini?')) return;
    const target = products.find(p => p.id === id);
    const allImages = target ? (target.images && target.images.length ? target.images : (target.image ? [target.image] : [])) : [];
    const ok = await ProductService.deleteProduct(id, { images: allImages });
    if (ok) {
      setProducts(await ProductService.getAllProducts());
      push('Produk dihapus', 'success');
    } else {
      push('Gagal menghapus produk', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Produk</h1>
          <p className="text-gray-400">Kelola daftar produk</p>
        </div>
        <button onClick={startCreate} className="px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700">Tambah Produk</button>
      </div>

      {!showForm && (
        <div className="bg-black/60 border border-pink-500/30 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 text-xs uppercase text-gray-400 px-4 py-2 border-b border-pink-500/20">
            <div className="col-span-5">Nama</div>
            <div className="col-span-2">Game</div>
            <div className="col-span-2">Harga</div>
            <div className="col-span-3 text-right">Aksi</div>
          </div>
          {loading ? (
            <div className="p-4 text-gray-400">Memuat...</div>
          ) : products.length === 0 ? (
            <div className="p-4 text-gray-400">Belum ada produk.</div>
          ) : (
            products.map(p => (
              <div key={p.id} className="grid grid-cols-12 items-center px-4 py-3 border-b border-pink-500/10">
                <div className="col-span-5 flex items-center gap-3">
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded object-cover" />
                  <div>
                    <div className="text-white font-medium line-clamp-1">{p.name}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">{p.accountLevel || '-'}</div>
                  </div>
                </div>
                <div className="col-span-2 text-gray-300">{p.gameTitleData?.name || p.gameTitle}</div>
                <div className="col-span-2 text-gray-300">Rp {p.price.toLocaleString('id-ID')}</div>
                <div className="col-span-3 text-right">
                  <button onClick={() => startEdit(p)} className="px-3 py-1.5 rounded border border-white/20 text-white hover:bg-white/10 mr-2">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="px-3 py-1.5 rounded border border-red-500/40 text-red-300 hover:bg-red-500/10">Hapus</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showForm && (
        <div className="bg-black/60 border border-pink-500/30 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nama Produk</label>
                <input value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Deskripsi</label>
                <textarea value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} rows={6} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Harga</label>
                  <input type="number" min={0} step={1000} value={form.price} onChange={(e)=>setForm({...form, price:Number(e.target.value)})} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Harga Asli (opsional)</label>
                  <input type="number" min={0} step={1000} value={form.originalPrice} onChange={(e)=>setForm({...form, originalPrice:Number(e.target.value)})} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Game</label>
                  <select value={form.gameTitleId} onChange={(e)=>setForm({...form, gameTitleId:e.target.value})} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white">
                    <option value="">-- pilih game --</option>
                    {games.map(g => (<option key={g.id} value={g.id}>{g.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tier</label>
                  <select value={form.tierId} onChange={(e)=>setForm({...form, tierId:e.target.value})} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white">
                    <option value="">-- pilih tier --</option>
                    {tiers.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Level Akun (opsional)</label>
                  <input value={form.accountLevel} onChange={(e)=>setForm({...form, accountLevel:e.target.value})} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Detail Akun (opsional)</label>
                  <input value={form.accountDetails} onChange={(e)=>setForm({...form, accountDetails:e.target.value})} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm text-gray-400">Gambar Produk</label>
              <ImageUploader
                images={form.images}
                onChange={(imgs)=>setForm({...form, images: imgs})}
                onUpload={(files, onProgress)=>uploadFiles(files, 'products', onProgress)}
                max={15}
              />
              <p className="text-xs text-gray-500">Urutkan dengan drag & drop. Gambar pertama menjadi cover.</p>

              <div className="mt-6 border-t border-white/10 pt-4">
                <div className="text-sm text-gray-400 mb-2">Rental Options</div>
                <div className="space-y-3">
                  {(form.rentals || []).map((r, idx) => (
                    <div key={idx} className="grid grid-cols-5 gap-2 items-center">
                      <input className="col-span-2 bg-black border border-white/20 rounded px-2 py-1 text-white" placeholder="Durasi (mis. 1 Hari)" value={r.duration} onChange={(e)=>{
                        const next = [...form.rentals]; next[idx] = { ...r, duration: e.target.value }; setForm({...form, rentals: next});
                      }} />
                      <input type="number" min={0} step={1000} className="col-span-2 bg-black border border-white/20 rounded px-2 py-1 text-white" placeholder="Harga" value={r.price} onChange={(e)=>{
                        const next = [...form.rentals]; next[idx] = { ...r, price: Number(e.target.value) }; setForm({...form, rentals: next});
                      }} />
                      <button className="text-red-300 border border-red-500/40 rounded px-2 py-1 hover:bg-red-500/10" onClick={()=>{
                        const next = [...form.rentals]; next.splice(idx,1); setForm({...form, rentals: next});
                      }}>Hapus</button>
                      <input className="col-span-5 bg-black border border-white/20 rounded px-2 py-1 text-white" placeholder="Deskripsi (opsional)" value={r.description || ''} onChange={(e)=>{
                        const next = [...form.rentals]; next[idx] = { ...r, description: e.target.value }; setForm({...form, rentals: next});
                      }} />
                    </div>
                  ))}
                  <button className="text-white border border-white/20 rounded px-2 py-1 hover:bg-white/10" onClick={()=>setForm({...form, rentals:[...(form.rentals||[]), { duration:'', price:0 }]})}>Tambah Rental</button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button onClick={cancelForm} className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10">Batal</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-60">{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
