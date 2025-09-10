import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { WebsiteSettings } from '../../types';
import { Save, Loader2, Image as ImageIcon } from 'lucide-react';
import PhoneInput from '../../components/PhoneInput';
import { useToast } from '../../components/Toast';

const AdminSettings: React.FC = () => {
  const { showToast } = useToast();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [form, setForm] = useState<any>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [faviconPreview, setFaviconPreview] = useState<string>('');
  const [phoneValidation, setPhoneValidation] = useState({ whatsapp: true });

  // Cleanup preview URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
      if (faviconPreview && faviconPreview.startsWith('blob:')) {
        URL.revokeObjectURL(faviconPreview);
      }
    };
  }, [logoPreview, faviconPreview]);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const test = await adminService.testConnection();
      if (!test.success) throw new Error('Admin service not available');
      const { data } = await adminService.getWebsiteSettings();
      const s = {
        id: data?.id ?? 'default',
        siteName: data?.site_name ?? '',
        heroTitle: data?.hero_title ?? '',
        heroSubtitle: data?.hero_subtitle ?? '',
        contactEmail: data?.contact_email ?? '',
        contactPhone: data?.contact_phone ?? '',
        whatsappNumber: data?.whatsapp_number ?? '',
        address: data?.address ?? '',
        facebookUrl: data?.facebook_url ?? '',
        instagramUrl: data?.instagram_url ?? '',
        tiktokUrl: data?.tiktok_url ?? '',
        youtubeUrl: data?.youtube_url ?? '',
        logoUrl: data?.logo_url ?? '',
        faviconUrl: data?.favicon_url ?? ''
      } as any;
      setSettings(s);
      setForm({
        siteName: s.siteName || '',
        heroTitle: s.heroTitle || '',
        heroSubtitle: s.heroSubtitle || '',
        contactEmail: s.contactEmail || '',
        contactPhone: s.contactPhone || '',
        whatsappNumber: s.whatsappNumber || '',
        address: s.address || '',
        facebookUrl: s.facebookUrl || '',
        instagramUrl: s.instagramUrl || '',
        tiktokUrl: s.tiktokUrl || '',
        youtubeUrl: s.youtubeUrl || '',
        logoUrl: s.logoUrl || '',
        faviconUrl: s.faviconUrl || '',
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      showToast('Gagal memuat pengaturan', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Reload settings on mount and when location.key changes to force fresh state
  useEffect(() => {
    let cancelled = false;
    // Reset local state to avoid stale form when remounted via Router
    setSettings(null);
    setForm({});
    setLogoFile(null);
    setFaviconFile(null);
    setLogoPreview('');
    setFaviconPreview('');
    (async () => {
      try {
        if (!cancelled) await loadSettings();
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [location.key, loadSettings]);

  const save = useCallback(async () => {
    // Validate phone numbers before saving
    if (!phoneValidation.whatsapp && form.whatsappNumber) {
      showToast('Nomor WhatsApp tidak valid. Pastikan format sudah benar.', 'error');
      return;
    }
    
    try {
      setSaving(true);
      const { success, data, error } = await adminService.upsertWebsiteSettings({
        ...form,
        logoFile,
        faviconFile
      });
      const updated = success ? {
        id: data?.id ?? 'default',
        siteName: data?.site_name ?? form.siteName,
        heroTitle: data?.hero_title ?? form.heroTitle,
        heroSubtitle: data?.hero_subtitle ?? form.heroSubtitle,
        contactEmail: data?.contact_email ?? form.contactEmail,
        contactPhone: data?.contact_phone ?? form.contactPhone,
        whatsappNumber: data?.whatsapp_number ?? form.whatsappNumber,
        address: data?.address ?? form.address,
        facebookUrl: data?.facebook_url ?? form.facebookUrl,
        instagramUrl: data?.instagram_url ?? form.instagramUrl,
        tiktokUrl: data?.tiktok_url ?? form.tiktokUrl,
        youtubeUrl: data?.youtube_url ?? form.youtubeUrl,
        logoUrl: data?.logo_url ?? form.logoUrl,
        faviconUrl: data?.favicon_url ?? form.faviconUrl,
        updatedAt: data?.updated_at
      } as any : null;
      if (updated) {
        setSettings(updated);
        showToast('Pengaturan berhasil disimpan', 'success');
        // Clear file inputs after successful save
        setLogoFile(null);
        setFaviconFile(null);
        if (logoPreview && logoPreview.startsWith('blob:')) {
          URL.revokeObjectURL(logoPreview);
        }
        if (faviconPreview && faviconPreview.startsWith('blob:')) {
          URL.revokeObjectURL(faviconPreview);
        }
        setLogoPreview('');
        setFaviconPreview('');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      showToast('Gagal menyimpan pengaturan', 'error');
    } finally {
      setSaving(false);
    }
  }, [form, logoFile, faviconFile, phoneValidation.whatsapp, showToast, logoPreview, faviconPreview]);

  const handleLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setLogoFile(f);
    if (f) {
      // Cleanup previous preview
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
      setLogoPreview(URL.createObjectURL(f));
    }
  }, [logoPreview]);

  const handleFaviconChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFaviconFile(f);
    if (f) {
      // Cleanup previous preview
      if (faviconPreview && faviconPreview.startsWith('blob:')) {
        URL.revokeObjectURL(faviconPreview);
      }
      setFaviconPreview(URL.createObjectURL(f));
    }
  }, [faviconPreview]);

  const updateForm = useCallback((key: string, value: string) => {
    setForm((p: any) => ({ ...p, [key]: value }));
  }, []);

  if (loading) return <div className="flex items-center gap-2 text-gray-400"><Loader2 className="animate-spin" size={18} /> Memuat...</div>;

  return (
    <div key={location.key} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Pengaturan Website</h1>
        <button disabled={saving} onClick={save} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60">
          <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>

      {/* General */}
      <section className="bg-black/40 border border-white/10 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-200 mb-3">Umum</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400">Nama Situs</label>
            <input value={form.siteName} onChange={e=>updateForm('siteName', e.target.value)} className="w-full mt-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-gray-400">Email Kontak</label>
            <input value={form.contactEmail} onChange={e=>updateForm('contactEmail', e.target.value)} className="w-full mt-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gray-400">Hero Title</label>
            <input value={form.heroTitle} onChange={e=>updateForm('heroTitle', e.target.value)} className="w-full mt-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gray-400">Hero Subtitle</label>
            <input value={form.heroSubtitle} onChange={e=>updateForm('heroSubtitle', e.target.value)} className="w-full mt-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2" />
          </div>
        </div>
      </section>

      {/* Contact & Social */}
      <section className="bg-black/40 border border-white/10 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-200 mb-3">Kontak & Sosial</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400">WhatsApp</label>
            <PhoneInput
              value={form.whatsappNumber}
              onChange={(value) => updateForm('whatsappNumber', value)}
              onValidationChange={(isValid) => setPhoneValidation(prev => ({...prev, whatsapp: isValid}))}
              placeholder="Masukkan Nomor WhatsApp"
              className="mt-1 bg-black/60 border-white/10"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Alamat</label>
            <textarea value={form.address} onChange={e=>updateForm('address', e.target.value)} className="w-full mt-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2" rows={3} />
          </div>
          <div>
            <label className="text-sm text-gray-400">Facebook</label>
            <input value={form.facebookUrl} onChange={e=>updateForm('facebookUrl', e.target.value)} className="w-full mt-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-gray-400">Instagram</label>
            <input value={form.instagramUrl} onChange={e=>updateForm('instagramUrl', e.target.value)} className="w-full mt-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-gray-400">TikTok</label>
            <input value={form.tiktokUrl} onChange={e=>updateForm('tiktokUrl', e.target.value)} className="w-full mt-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-gray-400">YouTube</label>
            <input value={form.youtubeUrl} onChange={e=>updateForm('youtubeUrl', e.target.value)} className="w-full mt-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2" />
          </div>
        </div>
      </section>

      {/* Branding */}
      <section className="bg-black/40 border border-white/10 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-200 mb-3">Branding</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400">Logo</label>
            <div className="mt-1 flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer">
                <ImageIcon size={16} /> Pilih Logo
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
              </label>
              {(logoPreview || settings?.logoUrl) && (
                <img src={logoPreview || settings?.logoUrl || ''} alt="logo" className="h-8 rounded border border-white/10" />
              )}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400">Favicon</label>
            <div className="mt-1 flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer">
                <ImageIcon size={16} /> Pilih Favicon
                <input type="file" className="hidden" accept="image/*" onChange={handleFaviconChange} />
              </label>
              {(faviconPreview || settings?.faviconUrl) && (
                <img src={faviconPreview || settings?.faviconUrl || ''} alt="favicon" className="h-8 rounded border border-white/10" />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminSettings;
