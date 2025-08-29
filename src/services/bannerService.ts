import { supabase } from './supabase.ts';
import { Banner } from '../types/index.ts';
import { uploadFile, deletePublicUrls } from './storageService.ts';

const sampleBanners: Banner[] = [
  {
    id: '1',
    title: 'Promo Spesial Akhir Pekan',
    subtitle: 'Diskon s.d. 50% untuk akun pilihan',
    imageUrl: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?w=1200',
    linkUrl: '/flash-sales',
    sortOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class BannerService {
  static async list(): Promise<Banner[]> {
    try {
      if (!supabase) return sampleBanners;
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data || []).map((b: any) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        imageUrl: b.image_url ?? b.imageUrl,
        linkUrl: b.link_url ?? b.linkUrl,
        sortOrder: b.sort_order ?? b.sortOrder ?? 0,
        isActive: b.is_active ?? b.isActive ?? true,
        createdAt: b.created_at ?? new Date().toISOString(),
        updatedAt: b.updated_at ?? new Date().toISOString(),
      }));
    } catch (e) {
      console.error('BannerService.list error:', e);
      return sampleBanners;
    }
  }

  static async create(input: Omit<Banner, 'id'|'createdAt'|'updatedAt'> & { file?: File | null }): Promise<Banner | null> {
    try {
      if (!supabase) return null;
      let image_url = input.imageUrl;
      if (input.file instanceof File) {
        const url = await uploadFile(input.file, 'banners');
        if (url) image_url = url;
      }
      const payload: any = {
        title: input.title,
        subtitle: input.subtitle ?? null,
        image_url,
        link_url: input.linkUrl ?? null,
        sort_order: input.sortOrder ?? 0,
        is_active: input.isActive ?? true,
      };
      const { data, error } = await (supabase as any)
        .from('banners')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return {
        id: data.id,
        title: data.title,
        subtitle: data.subtitle ?? undefined,
        imageUrl: data.image_url ?? image_url,
        linkUrl: data.link_url ?? undefined,
        sortOrder: data.sort_order ?? 0,
        isActive: data.is_active ?? true,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (e) {
      console.error('BannerService.create error:', e);
      return null;
    }
  }

  static async update(id: string, updates: Partial<Banner> & { file?: File | null }): Promise<Banner | null> {
    try {
      if (!supabase) return null;
      const payload: any = {
        title: updates.title,
        subtitle: updates.subtitle,
        image_url: updates.imageUrl,
        link_url: updates.linkUrl,
        sort_order: (updates as any).sortOrder,
        is_active: (updates as any).isActive,
      };
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
      if (updates.file instanceof File) {
        const url = await uploadFile(updates.file, 'banners');
        if (url) payload.image_url = url;
      }
      const { data, error } = await (supabase as any)
        .from('banners')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return {
        id: data.id,
        title: data.title,
        subtitle: data.subtitle ?? undefined,
        imageUrl: data.image_url ?? payload.image_url,
        linkUrl: data.link_url ?? undefined,
        sortOrder: data.sort_order ?? 0,
        isActive: data.is_active ?? true,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (e) {
      console.error('BannerService.update error:', e);
      return null;
    }
  }

  static async remove(id: string, existingImageUrl?: string): Promise<boolean> {
    try {
      if (!supabase) return false;
      const { error } = await (supabase as any)
        .from('banners')
        .delete()
        .eq('id', id);
      if (error) throw error;
      if (existingImageUrl) {
        try { await deletePublicUrls([existingImageUrl]); } catch {}
      }
      return true;
    } catch (e) {
      console.error('BannerService.remove error:', e);
      return false;
    }
  }
}
