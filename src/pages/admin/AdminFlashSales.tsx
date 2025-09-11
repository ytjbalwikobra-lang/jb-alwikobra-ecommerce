import React, { useEffect, useMemo, useState } from 'react';
import { Product } from '../../types';
import { ProductService } from '../../services/productService';
import { OptimizedProductService } from '../../services/optimizedProductService';
import { formatNumberID, parseNumberID } from '../../utils/helpers';
import { useToast } from '../../components/Toast';

type FSForm = {
  id?: string;
  product_id: string;
  sale_price: number;
  original_price?: number;
  start_time?: string;
  end_time: string;
  stock?: number;
  is_active?: boolean;
};

const emptyFS: FSForm = {
  product_id: '',
  sale_price: 0,
  original_price: 0,
  start_time: '',
  end_time: '',
  stock: 1,
  is_active: true,
};

const AdminFlashSales: React.FC = () => {
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FSForm>(emptyFS);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [paginatedResponse, fs] = await Promise.all([
          OptimizedProductService.getProductsPaginated(
            {}, // No filters - get all active products  
            { limit: 500 } // Admin view with large limit
          ),
          ProductService.getFlashSales(),
        ]);
        setProducts(paginatedResponse.data);
        setFlashSales(fs);
      } finally { setLoading(false); }
    })();
  }, []);

  const startCreate = () => {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    // Format for datetime-local (YYYY-MM-DDTHH:MM)
    const fmt = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setForm({
      product_id: '',
      sale_price: 0,
      original_price: 0,
      start_time: fmt(now),
      end_time: fmt(in24h),
      stock: 1,
      is_active: true,
    });
    setShowForm(true);
  };
  const startEdit = (row: any) => {
    setForm({
      id: row.id,
      product_id: row.productId || row.product_id,
      sale_price: row.salePrice || row.sale_price,
      original_price: row.originalPrice || row.original_price,
      start_time: row.startTime || row.start_time,
      end_time: row.endTime || row.end_time,
      stock: row.stock,
      is_active: row.isActive ?? row.is_active,
    });
    setShowForm(true);
  };
  const cancelForm = () => { setForm(emptyFS); setShowForm(false); };

  const refresh = async () => {
    const fs = await ProductService.getFlashSales();
    setFlashSales(fs);
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!form.product_id) errs.push('Produk wajib dipilih');
    if (!form.end_time) errs.push('Waktu berakhir wajib diisi');
    if (form.sale_price === undefined || Number(form.sale_price) <= 0) errs.push('Harga sale harus lebih dari 0');
    if (form.original_price && Number(form.original_price) <= Number(form.sale_price)) errs.push('Harga asli harus lebih besar dari harga sale');
    if (form.start_time && form.end_time && new Date(form.start_time) >= new Date(form.end_time)) errs.push('Waktu mulai harus sebelum waktu berakhir');
    return errs;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Compute safe defaults to satisfy DB NOT NULL constraints
      const selected = products.find(p => p.id === form.product_id);
      const computedOriginal = (form.original_price && Number(form.original_price) > 0)
        ? Number(form.original_price)
        : (selected?.originalPrice && Number(selected.originalPrice) > 0)
          ? Number(selected.originalPrice)
          : Number(selected?.price || form.sale_price || 0);

      const computedStart = form.start_time && form.start_time.trim().length > 0
        ? new Date(form.start_time).toISOString()
        : new Date().toISOString();

      const computedEnd = form.end_time ? new Date(form.end_time).toISOString() : '';

      // Re-validate with computed values
      const v = (() => {
        const errs: string[] = [];
        if (!form.product_id) errs.push('Produk wajib dipilih');
        if (!computedEnd) errs.push('Waktu berakhir wajib diisi');
        if (Number(form.sale_price) <= 0) errs.push('Harga sale harus lebih dari 0');
        if (computedOriginal <= Number(form.sale_price)) errs.push('Harga asli harus lebih besar dari harga sale');
        if (new Date(computedStart) >= new Date(computedEnd)) errs.push('Waktu mulai harus sebelum waktu berakhir');
        return errs;
      })();
      setErrors(v);
      if (v.length) { setSaving(false); return; }

      const payload = {
        product_id: form.product_id,
        sale_price: Number(form.sale_price),
        original_price: computedOriginal,
        start_time: computedStart,
        end_time: computedEnd,
        stock: form.stock ?? null,
        is_active: form.is_active ?? true,
      };

      if (form.id) await ProductService.updateFlashSale(form.id, payload);
      else await ProductService.createFlashSale(payload);
      await refresh();
      setShowForm(false);
  push('Flash sale disimpan', 'success');
    } catch (e: any) {
  const msg = e?.message || e?.error?.message || 'Terjadi kesalahan';
  push(`Gagal menyimpan: ${msg}` , 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus flash sale ini?')) return;
  const ok = await ProductService.deleteFlashSale(id);
  if (ok) { await refresh(); push('Flash sale dihapus', 'success'); } else { push('Gagal menghapus', 'error'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Flash Sale</h1>
          <p className="text-gray-400">Kelola event flash sale</p>
        </div>
        <button onClick={startCreate} className="px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700">Buat Flash Sale</button>
      </div>

      {!showForm && (
        <div className="bg-black/60 border border-pink-500/30 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 text-xs uppercase text-gray-400 px-4 py-2 border-b border-pink-500/20">
            <div className="col-span-4">Produk</div>
            <div className="col-span-2">Harga</div>
            <div className="col-span-2">Berakhir</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Aksi</div>
          </div>
          {loading ? (
            <div className="p-4 text-gray-400">Memuat…</div>
          ) : flashSales.length === 0 ? (
            <div className="p-4 text-gray-400">Belum ada flash sale.</div>
          ) : (
            flashSales.map((row: any) => (
              <div key={row.id} className="grid grid-cols-12 items-center px-4 py-3 border-b border-pink-500/10">
                <div className="col-span-4 text-white line-clamp-1">{row.product?.name || row.productId}</div>
                <div className="col-span-2 text-gray-300">Rp {Number((row.salePrice ?? row.sale_price) || 0).toLocaleString('id-ID')}</div>
                <div className="col-span-2 text-gray-300">{(row.endTime || row.end_time)?.replace('T',' ').slice(0,16)}</div>
                <div className="col-span-2">{(row.isActive ?? row.is_active) ? <span className="text-green-400">Aktif</span> : <span className="text-gray-400">Nonaktif</span>}</div>
                <div className="col-span-2 text-right">
                  <button onClick={()=>startEdit(row)} className="px-3 py-1.5 rounded border border-white/20 text-white hover:bg-white/10 mr-2">Edit</button>
                  <button onClick={()=>handleDelete(row.id)} className="px-3 py-1.5 rounded border border-red-500/40 text-red-300 hover:bg-red-500/10">Hapus</button>
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
              {errors.length ? (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded p-2">
                  <ul className="list-disc list-inside">
                    {errors.map((e,i)=>(<li key={i}>{e}</li>))}
                  </ul>
                </div>
              ) : null}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Produk</label>
                <select
                  value={form.product_id}
                  onChange={(e)=>{
                    const id = e.target.value;
                    const p = products.find(x=>x.id===id);
                    const newOriginal = p ? (p.originalPrice && Number(p.originalPrice) > 0 ? Number(p.originalPrice) : Number(p.price)) : 0;
                    setForm({...form, product_id: id, original_price: newOriginal});
                  }}
                  className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white"
                >
                  <option value="">-- pilih produk --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Harga Sale</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.sale_price ? formatNumberID(form.sale_price) : ''}
                    onChange={(e)=>setForm({...form, sale_price: parseNumberID(e.target.value)})}
                    placeholder="0"
                    className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Harga Asli (opsional)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.original_price ? formatNumberID(form.original_price) : ''}
                    onChange={(e)=>setForm({...form, original_price: parseNumberID(e.target.value)})}
                    placeholder="0"
                    className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Mulai (opsional)</label>
                  <input type="datetime-local" value={form.start_time || ''} max={form.end_time || undefined} onChange={(e)=>setForm({...form, start_time: e.target.value})} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Berakhir</label>
                  <input type="datetime-local" min={form.start_time || undefined} value={form.end_time} onChange={(e)=>setForm({...form, end_time: e.target.value})} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Stok (opsional)</label>
                  <input type="number" value={form.stock} onChange={(e)=>setForm({...form, stock: Number(e.target.value)})} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white" />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input id="is_active" type="checkbox" checked={!!form.is_active} onChange={(e)=>setForm({...form, is_active: e.target.checked})} />
                  <label htmlFor="is_active" className="text-gray-300">Aktif</label>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-black border border-white/20 rounded-xl p-3 text-sm text-gray-300">
                <div className="mb-2 font-semibold text-white">Preview</div>
                <div>Produk: {products.find(p=>p.id===form.product_id)?.name || '-'}</div>
                <div>Harga Sale: Rp {Number(form.sale_price||0).toLocaleString('id-ID')}</div>
                <div>Harga Asli: Rp {Number(form.original_price||0).toLocaleString('id-ID')}</div>
                <div>Berakhir: {form.end_time || '-'}</div>
                <div>Status: {form.is_active ? 'Aktif' : 'Nonaktif'}</div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-2">
            <button onClick={cancelForm} className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10">Batal</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-60">{saving ? 'Menyimpan…' : 'Simpan'}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFlashSales;
