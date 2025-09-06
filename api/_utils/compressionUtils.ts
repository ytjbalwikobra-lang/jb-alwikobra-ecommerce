// Response compression utility for Edge Functions
export function compressResponse(req: any, res: any, data: any) {
  // Set compression headers
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  if (acceptEncoding.includes('gzip')) {
    res.setHeader('Content-Encoding', 'gzip');
  }
  
  // Set cache control headers
  const cacheControl = getCacheControl(req.url);
  if (cacheControl) {
    res.setHeader('Cache-Control', cacheControl);
  }
  
  // Set ETag for caching
  const etag = generateETag(data);
  res.setHeader('ETag', etag);
  
  // Check if client has cached version
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }
  
  return res.json(data);
}

function getCacheControl(url: string): string | null {
  // Cache static data longer, dynamic data shorter
  if (url.includes('tiers') || url.includes('game-titles')) {
    // Metadata - cache for 10 minutes
    return 'public, max-age=600, stale-while-revalidate=300';
  }
  
  if (url.includes('products')) {
    // Products - cache for 2 minutes
    return 'public, max-age=120, stale-while-revalidate=60';
  }
  
  if (url.includes('settings')) {
    // Settings - cache for 5 minutes
    return 'public, max-age=300, stale-while-revalidate=180';
  }
  
  if (url.includes('dashboard')) {
    // Dashboard - cache for 1 minute
    return 'public, max-age=60, stale-while-revalidate=30';
  }
  
  // Orders and other dynamic data - minimal cache
  return 'public, max-age=30, stale-while-revalidate=15';
}

function generateETag(data: any): string {
  // Simple hash function for ETag
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `"${Math.abs(hash).toString(36)}"`;
}
