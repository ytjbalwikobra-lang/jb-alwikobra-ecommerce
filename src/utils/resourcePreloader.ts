// Resource preloader for critical assets
export class ResourcePreloader {
  private static loadedImages = new Set<string>();
  private static preloadedFonts = new Set<string>();

  // Preload critical images with intersection observer
  static preloadImage(src: string, priority: 'high' | 'low' = 'low'): Promise<void> {
    if (this.loadedImages.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.loadedImages.add(src);
        resolve();
      };
      img.onerror = reject;
      
      // Set loading priority
      img.loading = priority === 'high' ? 'eager' : 'lazy';
      img.decoding = 'async';
      img.src = src;
    });
  }

  // Preload multiple images in batches
  static async preloadImages(urls: string[], batchSize = 3): Promise<void> {
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      await Promise.allSettled(
        batch.map(url => this.preloadImage(url))
      );
    }
  }

  // Preload fonts
  static preloadFont(fontFamily: string, weight = '400'): Promise<void> {
    const key = `${fontFamily}-${weight}`;
    if (this.preloadedFonts.has(key)) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const font = new FontFace(fontFamily, `url(/fonts/${fontFamily}-${weight}.woff2)`, {
        weight,
        display: 'swap'
      });

      font.load().then(() => {
        document.fonts.add(font);
        this.preloadedFonts.add(key);
        resolve();
      }).catch(() => {
        // Fallback silently if font loading fails
        resolve();
      });
    });
  }

  // Preload critical CSS for a component
  static injectComponentCSS(css: string, id: string): void {
    if (document.getElementById(id)) return;

    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = css;
    document.head.appendChild(style);
  }

  // Cleanup resources when component unmounts
  static cleanup(): void {
    // Remove any non-critical preloaded resources
    const nonCriticalStyles = document.querySelectorAll('style[id*="component-"]');
    nonCriticalStyles.forEach(style => {
      if (style.id !== 'critical-css') {
        style.remove();
      }
    });
  }

  // Preload next route's resources
  static preloadRoute(routeName: string): void {
    const routeResources = {
      'products': [
        'https://images.unsplash.com/photo-1602367289840-74b3dfb3d7e8?w=400',
        'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=400'
      ],
      'flash-sales': [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
      ]
    };

    const resources = routeResources[routeName as keyof typeof routeResources];
    if (resources) {
      this.preloadImages(resources, 2);
    }
  }

  // Get image in preferred format (WebP/AVIF if supported)
  static getOptimizedImageUrl(baseUrl: string, format?: 'webp' | 'avif'): string {
    if (!format) {
      // Auto-detect best format
      if (this.supportsFormat('avif')) return `${baseUrl}&fm=avif&q=80`;
      if (this.supportsFormat('webp')) return `${baseUrl}&fm=webp&q=80`;
      return baseUrl;
    }

    return `${baseUrl}&fm=${format}&q=80`;
  }

  private static supportsFormat(format: string): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL(`image/${format}`).startsWith(`data:image/${format}`);
  }
}

// Auto preload critical resources
if (typeof window !== 'undefined') {
  // Preload critical fonts
  ResourcePreloader.preloadFont('Inter', '400');
  ResourcePreloader.preloadFont('Inter', '600');
}
