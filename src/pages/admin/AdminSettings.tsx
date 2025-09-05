import React, { useEffect, useState } from 'react';
import { SettingsService } from '../../services/settingsService.ts';
import { WebsiteSettings } from '../../types/index.ts';
import { Save, Loader2, Image as ImageIcon } from 'lucide-react';
import PhoneInput from '../../components/PhoneInput.tsx';

const AdminSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [form, setForm] = useState<any>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [faviconPreview, setFaviconPreview] = useState<string>('');
  const [phoneValidation, setPhoneValidation] = useState({ contactPhone: true, whatsapp: true });

  useEffect(() => { (async () => {
    setLoading(true);
    const s = await SettingsService.get();
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
      logoUrl: s.logoUrl || '',
      faviconUrl: s.faviconUrl || '',
    });
    setLoading(false);
  })(); }, []);

  const save = async () => {
    // Validate phone numbers before saving
    if (!phoneValidation.contactPhone && form.contactPhone) {
      alert('Nomor telepon kontak tidak valid. Pastikan format sudah benar.');
      return;
    }
    
    if (!phoneValidation.whatsapp && form.whatsappNumber) {
      alert('Nomor WhatsApp tidak valid. Pastikan format sudah benar.');
      return;
    }
    
    setSaving(true);
    const updated = await SettingsService.upsert({ ...form, logoFile, faviconFile });
    setSaving(false);
    if (updated) {
      setSettings(updated);
      alert('Pengaturan tersimpan');
    }
  };

  if (loading) return <div className="flex items-center gap-2 text-gray-400"><Loader2 className="animate-spin" size={18} /> Memuat...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Pengaturan Website</h1>
      <div className="bg-black/40 border border-pink-500/20 rounded-xl p-4 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400">Nama Situs</label>
            <input value={form.siteName} onChange={e=>setForm((p:any)=>({...p,siteName:e.target.value}))} className="w-full mt-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-gray-400">Email Kontak</label>
            <input value={form.contactEmail} onChange={e=>setForm((p:any)=>({...p,contactEmail:e.target.value}))} className="w-full mt-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-gray-400">Telepon</label>
            <PhoneInput
              value={form.contactPhone}
              onChange={(value) => setForm((p:any) => ({...p, contactPhone: value}))}
              onValidationChange={(isValid) => setPhoneValidation(prev => ({...prev, contactPhone: isValid}))}
              placeholder="Nomor telepon kontak"
              className="mt-1 bg-black/60 border-white/10"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">WhatsApp</label>
            <PhoneInput
              value={form.whatsappNumber}
              onChange={(value) => setForm((p:any) => ({...p, whatsappNumber: value}))}
              onValidationChange={(isValid) => setPhoneValidation(prev => ({...prev, whatsapp: isValid}))}
              placeholder="Nomor WhatsApp bisnis"
              className="mt-1 bg-black/60 border-white/10"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gray-400">Alamat</label>
            <textarea value={form.address} onChange={e=>setForm((p:any)=>({...p,address:e.target.value}))} className="w-full mt-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2" rows={3} />
          </div>
          <div>
            <label className="text-sm text-gray-400">Facebook</label>
            <input value={form.facebookUrl} onChange={e=>setForm((p:any)=>({...p,facebookUrl:e.target.value}))} className="w-full mt-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-gray-400">Instagram</label>
            <input value={form.instagramUrl} onChange={e=>setForm((p:any)=>({...p,instagramUrl:e.target.value}))} className="w-full mt-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-gray-400">TikTok</label>
            <input value={form.tiktokUrl} onChange={e=>setForm((p:any)=>({...p,tiktokUrl:e.target.value}))} className="w-full mt-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2" />
          </div>
          <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Logo</label>
              <div className="mt-1 flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer">
                  <ImageIcon size={16} /> Pilih Logo
                  <input type="file" className="hidden" accept="image/*" onChange={e=>{
                    const f = e.target.files?.[0]||null; setLogoFile(f);
                    if (f) setLogoPreview(URL.createObjectURL(f));
                  }} />
                </label>
                {(logoPreview || settings?.logoUrl) && (
                  <img src={logoPreview || settings?.logoUrl!} alt="logo" className="h-8 rounded border border-white/10" />
                )}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400">Favicon</label>
              <div className="mt-1 flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer">
                  <ImageIcon size={16} /> Pilih Favicon
                  <input type="file" className="hidden" accept="image/*" onChange={e=>{
                    const f = e.target.files?.[0]||null; setFaviconFile(f);
                    if (f) setFaviconPreview(URL.createObjectURL(f));
                  }} />
                </label>
                {(faviconPreview || settings?.faviconUrl) && (
                  <img src={faviconPreview || settings?.faviconUrl!} alt="favicon" className="h-8 rounded border border-white/10" />
                )}
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gray-400">Hero Title</label>
            <input value={form.heroTitle} onChange={e=>setForm((p:any)=>({...p,heroTitle:e.target.value}))} className="w-full mt-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gray-400">Hero Subtitle</label>
            <input value={form.heroSubtitle} onChange={e=>setForm((p:any)=>({...p,heroSubtitle:e.target.value}))} className="w-full mt-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2" />
          </div>
        </div>
        <div className="flex gap-2">
          <button disabled={saving} onClick={save} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60">
            <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
