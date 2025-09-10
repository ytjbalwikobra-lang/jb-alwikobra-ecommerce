import React, { useEffect, useState } from 'react';
import { enhancedBannerService } from '../services/enhancedBannerService';

interface Slide {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

// Default fallback slides
const defaultSlides: Slide[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1602367289840-74b3dfb3d7e8?w=1200',
    title: 'Flash Sale Setiap Hari',
    subtitle: 'Diskon hingga 70% untuk akun terpilih',
    ctaText: 'Lihat Flash Sale',
    ctaLink: '/flash-sales'
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=1200',
    title: 'Koleksi Akun Premium',
    subtitle: 'Akun terverifikasi kualitas terbaik',
    ctaText: 'Jelajahi Katalog',
    ctaLink: '/products'
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200',
    title: 'Rental Akun Mudah',
    subtitle: 'Sewa akun favorit sesuai kebutuhan',
    ctaText: 'Mulai Rental',
    ctaLink: '/products'
  }
];

type Props = { slides?: Slide[] };

const BannerCarousel: React.FC<Props> = ({ slides }) => {
  const [index, setIndex] = useState(0);
  const [dbSlides, setDbSlides] = useState<Slide[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load banners from enhanced service
  useEffect(() => {
    let mounted = true;
    
    const loadBanners = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const banners = await enhancedBannerService.list();
        
        if (mounted) {
          // Convert banners to slides
          const convertedSlides: Slide[] = banners
            .filter(banner => banner.isActive)
            .map(banner => ({
              id: banner.id,
              image: banner.imageUrl,
              title: banner.title,
              subtitle: banner.subtitle,
              ctaText: banner.linkUrl ? 'Lihat Detail' : undefined,
              ctaLink: banner.linkUrl
            }));
          
          setDbSlides(convertedSlides.length > 0 ? convertedSlides : []);
        }
      } catch (err: any) {
        console.error('Failed to load banners:', err);
        if (mounted) {
          setError(err.message || 'Gagal memuat banner');
          setDbSlides([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadBanners();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Determine which slides to show
  const resolvedSlides = (dbSlides && dbSlides.length > 0)
    ? dbSlides
    : (slides && slides.length > 0 ? slides : defaultSlides);

  const count = Math.min(resolvedSlides.length, 3);

  // Auto-rotate slides
  useEffect(() => {
    if (count <= 1) return;
    
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(id);
  }, [count]);

  if (loading) {
    return (
      <div className="relative rounded-2xl overflow-hidden shadow-md border border-pink-500/40">
        <div className="w-full aspect-[3/2] bg-gray-800 animate-pulse flex items-center justify-center">
          <div className="text-gray-400">Memuat banner...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative rounded-2xl overflow-hidden shadow-md border border-red-500/40">
        <div className="w-full aspect-[3/2] bg-red-900/20 flex items-center justify-center">
          <div className="text-red-400 text-center p-4">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (count === 0) return null;

  const active = resolvedSlides[index];

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-md border border-pink-500/40">
      {/* iOS-compatible aspect ratio container */}
      <div className="relative w-full aspect-[3/2]">
        <img
          src={active.image}
          alt={active.title || 'Banner'}
          className="absolute inset-0 w-full h-full object-cover ios-image"
          onError={(e) => {
            console.error('Banner image failed to load:', active.image);
            // Fallback to a default image
            e.currentTarget.src = 'https://images.unsplash.com/photo-1602367289840-74b3dfb3d7e8?w=1200&h=800&fit=crop';
          }}
        />

        {/* iOS-compatible gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Content with iOS safe area support */}
        <div className="absolute inset-0 p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-end ios-safe-area">
          {(active.title || active.subtitle) && (
            <div className="text-white max-w-full sm:max-w-md lg:max-w-xl">
              {active.title && (
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 leading-tight drop-shadow-lg">
                  {active.title}
                </h3>
              )}
              {active.subtitle && (
                <p className="text-white/95 mb-2 sm:mb-3 md:mb-4 text-sm sm:text-base leading-snug drop-shadow-md">
                  {active.subtitle}
                </p>
              )}
              {active.ctaText && active.ctaLink && (
                <a 
                  href={active.ctaLink} 
                  className="inline-block ios-button ios-button-primary px-3 sm:px-4 md:px-5 py-2 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  {active.ctaText}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* iOS-optimized dots indicator */}
      {count > 1 && (
        <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 sm:space-x-2">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 sm:h-2.5 rounded-full transition-all duration-200 ios-touch-target ${
                i === index 
                  ? 'w-4 sm:w-6 bg-white shadow-lg' 
                  : 'w-2 sm:w-2.5 bg-white/70 hover:bg-white/90'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;
