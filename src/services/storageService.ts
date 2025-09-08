import { supabase } from './supabase.ts';

const BUCKET = process.env.REACT_APP_SUPABASE_STORAGE_BUCKET || 'product-images';

export async function uploadFile(file: File, folder = 'products'): Promise<string | null> {
  if (!supabase) throw new Error('Supabase not initialized');
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeName = file.name.replace(/[^a-zA-Z0-9-_\.]/g, '_');
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}_${safeName}`;
  const { error } = await (supabase as any).storage.from(BUCKET).upload(path, file, {
    upsert: false,
    cacheControl: '3600',
    contentType: file.type || `image/${ext}`
  });
  if (error) {
    console.error('Upload error:', error);
    throw error;
  }
  const { data } = (supabase as any).storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

export async function uploadFiles(
  files: File[],
  folder = 'products',
  onProgress?: (done: number, total: number) => void,
): Promise<string[]> {
  const urls: string[] = [];
  const total = files.length;
  let done = 0;
  for (const f of files) {
    const url = await uploadFile(f, folder);
    if (url) urls.push(url);
    done += 1;
    try { onProgress?.(done, total); } catch {}
  }
  return urls;
}

function urlToPath(url: string): string | null {
  try {
    const u = new URL(url);
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const idx = u.pathname.indexOf(marker);
    if (idx === -1) return null;
    return u.pathname.substring(idx + marker.length) + (u.search || '');
  } catch {
    return null;
  }
}

export async function deletePublicUrls(urls: string[]): Promise<void> {
  if (!supabase || !urls.length) return;
  const paths = urls.map(urlToPath).filter(Boolean) as string[];
  if (!paths.length) return;
  const { error } = await (supabase as any).storage.from(BUCKET).remove(paths);
  if (error) console.warn('Storage delete warning:', error);
}

// Game Logo Storage Functions
export class GameLogoStorage {
  private static readonly BUCKET = 'game-logos';
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  private static async toBase64(file: File): Promise<string> {
    const buf = await file.arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(buf);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  /**
   * Upload game logo to Supabase Storage
   */
  static async uploadGameLogo(file: File, gameSlug: string): Promise<string> {
    try {
      // Validate file
      this.validateFile(file);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${gameSlug}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Try client upload first (may fail due to RLS)
      try {
        const { data, error } = await (supabase as any).storage
          .from(this.BUCKET)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        if (error) throw error;
        return data.path;
      } catch (clientErr: any) {
        console.warn('Client upload blocked, falling back to admin API:', clientErr?.message || clientErr);
        // Fallback to server-side upload via admin API (bypasses RLS)
        const payload = {
          name: file.name,
          contentType: file.type || 'application/octet-stream',
          dataBase64: await this.toBase64(file),
          slug: gameSlug,
        };
        const res = await fetch('/api/admin?action=upload-game-logo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
          },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (!res.ok || !json?.path) {
          throw new Error(json?.error || 'Admin upload failed');
        }
        // Return storage path from server
        return json.path as string;
      }
    } catch (error) {
      console.error('Error uploading game logo:', error);
      throw error;
    }
  }

  /**
   * Update existing game logo
   */
  static async updateGameLogo(file: File, gameSlug: string, oldPath?: string): Promise<string> {
    try {
      // Delete old file if exists
      if (oldPath) {
        await this.deleteGameLogo(oldPath);
      }

      // Upload new file
      return await this.uploadGameLogo(file, gameSlug);
    } catch (error) {
      console.error('Error updating game logo:', error);
      throw error;
    }
  }

  /**
   * Delete game logo from storage
   */
  static async deleteGameLogo(filePath: string): Promise<void> {
    try {
      const { error } = await (supabase as any).storage
        .from(this.BUCKET)
        .remove([filePath]);

      if (error) {
        console.error('Error deleting file:', error);
        // Don't throw error for delete failures to avoid blocking updates
      }
    } catch (error) {
      console.error('Error deleting game logo:', error);
      // Don't throw error for delete failures
    }
  }

  /**
   * Get public URL for uploaded game logo
   */
  static getGameLogoUrl(filePath: string): string {
    const { data } = (supabase as any).storage
      .from(this.BUCKET)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Validate uploaded file
   */
  private static validateFile(file: File): void {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size too large. Maximum size is ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${this.ALLOWED_TYPES.join(', ')}`);
    }
  }
}

// Export instance for easy use
export const gameLogoStorage = GameLogoStorage;
