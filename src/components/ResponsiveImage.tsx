import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  aspectRatio?: number;
  onLoad?: () => void;
  onError?: () => void;
}

// Image format support detection
class ImageFormatDetector {
  private static cache = new Map<string, boolean>();

  static async supportsFormat(format: 'webp' | 'avif'): Promise<boolean> {
    if (this.cache.has(format)) {
      return this.cache.get(format)!;
    }

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        this.cache.set(format, false);
        resolve(false);
        return;
      }

      canvas.toBlob((blob) => {
        const supported = blob !== null;
        this.cache.set(format, supported);
        resolve(supported);
      }, `image/${format}`, 0.1);
    });
  }
}

// Image URL optimizer
class ImageOptimizer {
  private static readonly CDN_BASE = 'https://images.unsplash.com/';

  static optimizeUrl(
    originalUrl: string,
    options: {
      width?: number;
      quality?: number;
      format?: 'webp' | 'avif' | 'auto';
      dpr?: number;
    } = {}
  ): string {
  // Guard invalid url
  if (!originalUrl || typeof originalUrl !== 'string') return '';
    // If it's an Unsplash image, use their optimization API
  if (originalUrl.includes('unsplash.com')) {
      const url = new URL(originalUrl);
      const params = new URLSearchParams(url.search);
      
      if (options.width) params.set('w', options.width.toString());
      if (options.quality) params.set('q', options.quality.toString());
      if (options.format && options.format !== 'auto') params.set('fm', options.format);
      if (options.dpr) params.set('dpr', options.dpr.toString());
      
      // Add optimization flags
      params.set('auto', 'format,compress');
      params.set('fit', 'crop');
      
      url.search = params.toString();
      return url.toString();
    }

    // For other images, return as-is (could be extended with other CDN support)
    return originalUrl;
  }

  static generateSrcSet(
    originalUrl: string,
    breakpoints: number[] = [320, 640, 768, 1024, 1280, 1920],
    format?: 'webp' | 'avif'
  ): string {
  if (!originalUrl || typeof originalUrl !== 'string') return '';
    return breakpoints
      .map(width => {
        const optimizedUrl = this.optimizeUrl(originalUrl, { width, quality: 80, format });
        return `${optimizedUrl} ${width}w`;
      })
      .join(', ');
  }
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = React.memo(({
  src,
  alt,
  className = '',
  sizes = '100vw',
  priority = false,
  quality = 80,
  placeholder = 'blur',
  blurDataURL,
  aspectRatio,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(priority);
  const [error, setError] = useState(false);
  const [formats, setFormats] = useState<{
    supportsAvif: boolean;
    supportsWebp: boolean;
  }>({ supportsAvif: false, supportsWebp: false });
  
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect supported formats
  useEffect(() => {
    const detectFormats = async () => {
      const [supportsAvif, supportsWebp] = await Promise.all([
        ImageFormatDetector.supportsFormat('avif'),
        ImageFormatDetector.supportsFormat('webp')
      ]);
      
      setFormats({ supportsAvif, supportsWebp });
    };

    detectFormats();
  }, []);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setError(true);
    setIsLoaded(true);
    onError?.();
  }, [onError]);

  // Generate optimized URLs
  const getOptimizedSrc = (format?: 'webp' | 'avif') => {
  return ImageOptimizer.optimizeUrl(src, { quality, format: format || 'auto' }) || defaultBlurDataURL;
  };

  const getSrcSet = (format?: 'webp' | 'avif') => {
  return ImageOptimizer.generateSrcSet(src, undefined, format) || undefined;
  };

  // Generate blur placeholder
  const defaultBlurDataURL = blurDataURL || 
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMzMzO3N0b3Atb3BhY2l0eTowLjgiIC8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzU1NTtzdG9wLW9wYWNpdHk6MC42IiAvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0idXJsKCNncmFkaWVudCkiLz4KPC9zdmc+';

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        aspectRatio: aspectRatio ? `${aspectRatio}` : undefined
      }}
    >
      {/* Placeholder */}
      {!isLoaded && placeholder === 'blur' && (
        <img
          src={defaultBlurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ 
            filter: 'blur(10px) brightness(0.8)',
            transform: 'scale(1.1)' // Prevent blur edge artifacts
          }}
        />
      )}

      {/* Progressive Enhancement: Multiple Sources */}
      {isVisible && (
        <picture>
          {/* AVIF Source */}
          {formats.supportsAvif && !error && (
            <source
              srcSet={getSrcSet('avif')}
              sizes={sizes}
              type="image/avif"
            />
          )}
          
          {/* WebP Source */}
          {formats.supportsWebp && !error && (
            <source
              srcSet={getSrcSet('webp')}
              sizes={sizes}
              type="image/webp"
            />
          )}
          
          {/* Fallback */}
          <img
            ref={imgRef}
            src={error ? defaultBlurDataURL : getOptimizedSrc()}
            srcSet={error ? undefined : getSrcSet()}
            sizes={sizes}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            className={`w-full h-full object-cover transition-opacity duration-500 ease-out ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              willChange: isLoaded ? 'auto' : 'opacity',
              aspectRatio: aspectRatio ? `${aspectRatio}` : undefined
            }}
          />
        </picture>
      )}

      {/* Loading indicator */}
      {!isLoaded && isVisible && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white text-sm">
          <div className="text-center p-4">
            <div className="text-gray-400 mb-2">⚠️</div>
            <div>Image failed to load</div>
          </div>
        </div>
      )}
    </div>
  );
});

export default ResponsiveImage;
