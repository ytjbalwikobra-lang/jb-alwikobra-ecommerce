// Lightweight prefetch helpers for routes and api data
// - Uses link rel=prefetch/preload where supported
// - Falls back to dynamic import warmups and navigator.connection heuristics

type PrefetchPriority = 'low' | 'auto' | 'high';

const supportsLinkPrefetch = (() => {
  if (typeof document === 'undefined') return false;
  try {
    const l = document.createElement('link');
    return !!(l.relList && l.relList.supports && l.relList.supports('prefetch'));
  } catch {
    return false;
  }
})();

export function prefetchRoute(chunkHref: string, priority: PrefetchPriority = 'auto') {
  if (typeof document === 'undefined') return;
  if (supportsLinkPrefetch) {
    const l = document.createElement('link');
    l.rel = 'prefetch';
    l.as = 'script';
    l.href = chunkHref;
    if (priority !== 'auto') (l as any).fetchPriority = priority;
    document.head.appendChild(l);
  }
}

export function warmImport<T>(importer: () => Promise<T>) {
  // Fire-and-forget to warm code cache
  try {
    void importer();
  } catch {
    // ignore
  }
}

export function onIdle(cb: () => void, timeout = 1200) {
  if (typeof window === 'undefined') return;
  const ri = (window as any).requestIdleCallback as undefined | ((cb: any, opts?: any) => any);
  if (ri) {
    ri(cb, { timeout });
  } else {
    setTimeout(cb, Math.min(timeout, 1500));
  }
}

export function shouldPrefetch(): boolean {
  if (typeof navigator === 'undefined') return true;
  const anyNav: any = navigator as any;
  const conn = anyNav.connection || anyNav.mozConnection || anyNav.webkitConnection;
  if (!conn) return true;
  const saveData = !!conn.saveData;
  const slow = ['slow-2g', '2g'].includes(conn.effectiveType);
  return !saveData && !slow;
}

export function prefetchJSON(url: string, signal?: AbortSignal): void {
  if (typeof fetch === 'undefined' || !shouldPrefetch()) return;
  try {
    void fetch(url, { method: 'GET', mode: 'no-cors', cache: 'no-store', signal }).catch((err) => {
      // Ignore network errors during speculative prefetch
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.debug('Prefetch JSON skipped/error:', err?.message || err);
      }
    });
  } catch (e) {
    // Swallow, prefetch is best-effort
  }
}

// Simple Hover/Touch prefetch binder
export function bindHoverPrefetch(el: Element, run: () => void) {
  const onEnter = () => run();
  const onTouchStart = () => {
    // prefetch just before navigation on mobile
    run();
  };
  el.addEventListener('pointerenter', onEnter, { passive: true });
  el.addEventListener('touchstart', onTouchStart, { passive: true });
  return () => {
    el.removeEventListener('pointerenter', onEnter as any);
    el.removeEventListener('touchstart', onTouchStart as any);
  };
}
