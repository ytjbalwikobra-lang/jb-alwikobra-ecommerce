import { supabase } from './supabase';
import { WebsiteSettings } from '../types/index';
import { uploadFile } from './storageService';

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
      const resp = await supabase
        .from('website_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (resp.error) throw resp.error;
      const data = resp.data as Record<string, unknown> | null;
      if (!data) return DEFAULT_SETTINGS;
      return {
        id: (data.id as string) ?? 'default',
        siteName: (data.site_name as string | undefined) ?? DEFAULT_SETTINGS.siteName,
        logoUrl: data.logo_url as string | undefined,
        faviconUrl: data.favicon_url as string | undefined,
        contactEmail: data.contact_email as string | undefined,
        contactPhone: data.contact_phone as string | undefined,
        whatsappNumber: data.whatsapp_number as string | undefined,
        address: data.address as string | undefined,
        facebookUrl: data.facebook_url as string | undefined,
        instagramUrl: data.instagram_url as string | undefined,
        tiktokUrl: data.tiktok_url as string | undefined,
        youtubeUrl: data.youtube_url as string | undefined,
        heroTitle: data.hero_title as string | undefined,
        heroSubtitle: data.hero_subtitle as string | undefined,
        updatedAt: data.updated_at as string | undefined,
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
  const payload: Record<string, unknown> = {
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
      let data: unknown = null;
      let error: unknown = null;
      if (current.id && current.id !== 'default') {
        const resp = await supabase
          .from('website_settings')
          .update(payload)
          .eq('id', current.id)
          .select()
          .single();
        data = resp.data;
        error = resp.error;
      } else {
        const resp = await supabase
          .from('website_settings')
          .insert(payload)
          .select()
          .single();
        data = resp.data;
        error = resp.error;
      }
      if (error) throw error as Error;
      const row = (data && typeof data === 'object' ? data : payload) as Record<string, unknown>;
      return {
        id: (row.id as string) ?? current.id ?? 'default',
        siteName: (row.site_name as string) ?? current.siteName,
        logoUrl: (row.logo_url as string | undefined) ?? current.logoUrl,
        faviconUrl: (row.favicon_url as string | undefined) ?? current.faviconUrl,
        contactEmail: (row.contact_email as string | undefined) ?? current.contactEmail,
        contactPhone: (row.contact_phone as string | undefined) ?? current.contactPhone,
        whatsappNumber: (row.whatsapp_number as string | undefined) ?? current.whatsappNumber,
        address: (row.address as string | undefined) ?? current.address,
        facebookUrl: (row.facebook_url as string | undefined) ?? current.facebookUrl,
        instagramUrl: (row.instagram_url as string | undefined) ?? current.instagramUrl,
        tiktokUrl: (row.tiktok_url as string | undefined) ?? current.tiktokUrl,
        youtubeUrl: (row.youtube_url as string | undefined) ?? current.youtubeUrl,
        heroTitle: (row.hero_title as string | undefined) ?? current.heroTitle,
        heroSubtitle: (row.hero_subtitle as string | undefined) ?? current.heroSubtitle,
        updatedAt: (row.updated_at as string | undefined) ?? new Date().toISOString(),
      };
    } catch (e) {
      console.error('SettingsService.upsert error:', e);
      return null;
    }
  }
}
