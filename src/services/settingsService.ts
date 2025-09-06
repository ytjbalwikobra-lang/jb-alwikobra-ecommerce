import { supabase } from './supabase.ts';
import { WebsiteSettings } from '../types/index.ts';
import { uploadFile, deletePublicUrls } from './storageService.ts';

const DEFAULT_SETTINGS: WebsiteSettings = {
  id: 'default',
  siteName: 'JB Alwikobra',
  heroTitle: 'Jual Beli & Rental Akun Game',
  heroSubtitle: 'Aman, cepat, terpercaya',
};

export class SettingsService {
  static async get(): Promise<WebsiteSettings> {
    try {
      if (!supabase) return DEFAULT_SETTINGS;
      const { data, error } = await (supabase as any)
        .from('website_settings')
        .select(`
          id, site_name, logo_url, favicon_url, contact_email, contact_phone, 
          whatsapp_number, address, facebook_url, instagram_url, tiktok_url, 
          youtube_url, hero_title, hero_subtitle, updated_at
        `)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return DEFAULT_SETTINGS;
      return {
        id: data.id ?? 'default',
        siteName: data.site_name ?? DEFAULT_SETTINGS.siteName,
        logoUrl: data.logo_url ?? undefined,
        faviconUrl: data.favicon_url ?? undefined,
        contactEmail: data.contact_email ?? undefined,
        contactPhone: data.contact_phone ?? undefined,
        whatsappNumber: data.whatsapp_number ?? undefined,
        address: data.address ?? undefined,
        facebookUrl: data.facebook_url ?? undefined,
        instagramUrl: data.instagram_url ?? undefined,
        tiktokUrl: data.tiktok_url ?? undefined,
        youtubeUrl: data.youtube_url ?? undefined,
        heroTitle: data.hero_title ?? undefined,
        heroSubtitle: data.hero_subtitle ?? undefined,
        updatedAt: data.updated_at ?? undefined,
      };
    } catch (e) {
      console.error('SettingsService.get error:', e);
      return DEFAULT_SETTINGS;
    }
  }

  static async upsert(input: Partial<WebsiteSettings> & { logoFile?: File | null; faviconFile?: File | null }): Promise<WebsiteSettings | null> {
    try {
      if (!supabase) return null;
      const current = await this.get();
      const payload: any = {
        site_name: input.siteName ?? current.siteName ?? null,
        contact_email: input.contactEmail ?? current.contactEmail ?? null,
        contact_phone: input.contactPhone ?? current.contactPhone ?? null,
        whatsapp_number: input.whatsappNumber ?? current.whatsappNumber ?? null,
        address: input.address ?? current.address ?? null,
        facebook_url: input.facebookUrl ?? current.facebookUrl ?? null,
        instagram_url: input.instagramUrl ?? current.instagramUrl ?? null,
        tiktok_url: input.tiktokUrl ?? current.tiktokUrl ?? null,
        youtube_url: input.youtubeUrl ?? current.youtubeUrl ?? null,
        hero_title: input.heroTitle ?? current.heroTitle ?? null,
        hero_subtitle: input.heroSubtitle ?? current.heroSubtitle ?? null,
      };
      if (input.logoFile instanceof File) {
        const url = await uploadFile(input.logoFile, 'settings');
        if (url) payload.logo_url = url;
      } else if (input.logoUrl) {
        payload.logo_url = input.logoUrl;
      }
      if (input.faviconFile instanceof File) {
        const url = await uploadFile(input.faviconFile, 'settings');
        if (url) payload.favicon_url = url;
      } else if (input.faviconUrl) {
        payload.favicon_url = input.faviconUrl;
      }
      const { data, error } = await (supabase as any)
        .from('website_settings')
        .upsert({ id: current.id === 'default' ? undefined : current.id, ...payload }, { onConflict: 'id' })
        .select()
        .maybeSingle();
      if (error) throw error;
      const row = data || payload;
      return {
        id: row.id ?? current.id ?? 'default',
        siteName: row.site_name ?? current.siteName,
        logoUrl: row.logo_url ?? current.logoUrl,
        faviconUrl: row.favicon_url ?? current.faviconUrl,
        contactEmail: row.contact_email ?? current.contactEmail,
        contactPhone: row.contact_phone ?? current.contactPhone,
        whatsappNumber: row.whatsapp_number ?? current.whatsappNumber,
        address: row.address ?? current.address,
        facebookUrl: row.facebook_url ?? current.facebookUrl,
        instagramUrl: row.instagram_url ?? current.instagramUrl,
        tiktokUrl: row.tiktok_url ?? current.tiktokUrl,
        youtubeUrl: row.youtube_url ?? current.youtubeUrl,
        heroTitle: row.hero_title ?? current.heroTitle,
        heroSubtitle: row.hero_subtitle ?? current.heroSubtitle,
        updatedAt: row.updated_at ?? new Date().toISOString(),
      };
    } catch (e) {
      console.error('SettingsService.upsert error:', e);
      return null;
    }
  }
}
