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
