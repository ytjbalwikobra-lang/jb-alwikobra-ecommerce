import React, { useEffect, useMemo, useState } from 'react';
import { GameTitle } from '../../types/index.ts';
import { adminService } from '../../services/adminService.ts';
import { useToast } from '../../components/Toast.tsx';
import { gameLogoStorage } from '../../services/storageService.ts';
import { Plus, Pencil, Trash2, RefreshCw, Upload, X, Edit2 } from 'lucide-react';
import { AdminPillBadge } from '../../components/admin/AdminPillBadge.tsx';

type FormState = {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  logo_url?: string;
  logo_file?: File | null;
  logo_preview?: string;
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
  logo_file: null,
  logo_preview: '',
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
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      // Load via adminService for consistent privileges
      const { data, error } = await adminService.getGameTitles();
      if (error) throw error;

      const list = (data || []).map((gameTitle: any) => {
        // Get logo URL - prefer new logo_path with public URL, fallback to legacy logo_url
        let logoUrl = gameTitle.logo_url || gameTitle.logoUrl || '';

        return {
          ...gameTitle,
          isPopular: gameTitle.is_popular,
          isActive: gameTitle.is_active,
          sortOrder: gameTitle.sort_order,
          logoUrl,
          createdAt: gameTitle.created_at,
          updatedAt: gameTitle.updated_at
        };
      }) || [];

      setItems(list);
    } catch (e: any) {
      push(`Gagal memuat Game Titles: ${e?.message || e}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // File upload functions
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Validate file before creating preview
      if (file.size > 5 * 1024 * 1024) {
        push('Ukuran file terlalu besar. Maksimal 5MB', 'error');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        push('Tipe file tidak didukung. Gunakan JPEG, PNG, GIF, atau WebP', 'error');
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setForm(prev => ({
        ...prev,
        logo_file: file,
        logo_preview: previewUrl,
        logo_url: '' // Clear existing URL when file is selected
      }));
    } catch (error: any) {
      push(`Error selecting file: ${error.message}`, 'error');
    }
  };

  const clearFile = () => {
    if (form.logo_preview) {
      URL.revokeObjectURL(form.logo_preview);
    }
    setForm(prev => ({
      ...prev,
      logo_file: null,
      logo_preview: ''
    }));
  };

  const cancelForm = () => { 
    if (form.logo_preview) {
      URL.revokeObjectURL(form.logo_preview);
    }
    setShowForm(false); 
    setForm(emptyForm); 
  };

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
      logo_file: null,
      logo_preview: '',
      is_active: gt.isActive !== false,
      sort_order: gt.sortOrder || 0,
    });
    setShowForm(true);
  };

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
  const test = await adminService.testConnection();
  if (!test.success) { push('Admin service belum dikonfigurasi.', 'error'); return; }
    if (!form.name || !form.slug) { push('Nama dan slug wajib diisi', 'error'); return; }
    setSaving(true);
    setUploading(form.logo_file !== null);
    
    try {
      let logoPath = form.logo_url || null; // Keep existing URL if no new file

      // Handle file upload if a new file is selected
      if (form.logo_file) {
        try {
          logoPath = await gameLogoStorage.uploadGameLogo(form.logo_file, form.slug);
          
          // If editing and there was an old logo, delete it
          if (form.id && form.logo_url) {
            // Extract path from URL or use logo_path if available from database
            // This would need to be implemented based on your database schema
          }
        } catch (uploadError: any) {
          throw new Error(`Failed to upload logo: ${uploadError.message}`);
        }
      }

      const payload = {
        ...toDbPayload(form),
        logo_path: logoPath // Use logo_path for new storage system
      };

      if (!form.id) {
        const { error } = await adminService.createGameTitle(payload);
        if (error) throw error;
        push('Game title ditambahkan dengan logo berhasil', 'success');
      } else {
        const { error } = await adminService.updateGameTitle(form.id, payload);
        if (error) throw error;
        push('Game title diperbarui dengan logo berhasil', 'success');
      }
      
      // Clean up preview URL
      if (form.logo_preview) {
        URL.revokeObjectURL(form.logo_preview);
      }
      
      setShowForm(false);
      setForm(emptyForm);
      await load();
    } catch (e: any) {
      push(`Gagal menyimpan: ${e?.message || e}`, 'error');
    } finally { 
      setSaving(false); 
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    const test = await adminService.testConnection();
    if (!test.success) return;
    if (!confirm('Hapus game title ini?')) return;
    try {
      const { success, error } = await adminService.deleteGameTitle(id);
      if (!success || error) throw error;
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
            <div className="col-span-2">
              <AdminPillBadge variant={gt.isActive ? 'success' : 'secondary'}>
                {gt.isActive ? 'Aktif' : 'Nonaktif'}
              </AdminPillBadge>
            </div>
            <div className="col-span-3 text-right">
              <button 
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors mr-2" 
                onClick={() => startEdit(gt)}
                title="Edit Game Title"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" 
                onClick={() => remove(gt.id)}
                title="Hapus Game Title"
              >
                <Trash2 className="w-4 h-4" />
              </button>
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
              <label className="block text-sm text-gray-400 mb-1">Logo Game</label>
              
              {/* Current Logo Display */}
              {(form.logo_preview || form.logo_url) && (
                <div className="mb-3 p-2 border border-white/20 rounded bg-black/40">
                  <div className="flex items-center gap-3">
                    <img 
                      src={form.logo_preview || form.logo_url} 
                      alt="Logo preview" 
                      className="w-12 h-12 object-cover rounded border border-white/20"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        {form.logo_file ? 'File baru dipilih' : 'Logo saat ini'}
                      </p>
                      {form.logo_file && (
                        <p className="text-xs text-gray-400">{form.logo_file.name}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={clearFile}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* File Upload */}
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-pink-500/50 hover:bg-pink-500/5 transition-colors"
                >
                  <Upload size={20} className="text-gray-400" />
                  <span className="text-sm text-gray-400">
                    {form.logo_file ? 'Ganti logo' : 'Pilih file logo'}
                  </span>
                </label>
                <p className="text-xs text-gray-500">
                  Format: JPEG, PNG, GIF, WebP • Maksimal 5MB
                </p>
              </div>

              {/* Alternative URL Input */}
              <div className="mt-3">
                <label className="block text-sm text-gray-400 mb-1">Atau gunakan URL</label>
                <input 
                  value={form.logo_url} 
                  onChange={e=>setForm({...form, logo_url: e.target.value, logo_file: null, logo_preview: ''})} 
                  className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white text-sm" 
                  placeholder="https://example.com/logo.png"
                />
              </div>
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
            <button 
              onClick={save} 
              disabled={saving || uploading} 
              className="px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-60 flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Upload size={16} className="animate-pulse" />
                  Mengupload logo...
                </>
              ) : saving ? (
                'Menyimpan...'
              ) : (
                'Simpan'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGameTitles;
