/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-floating-promises, @typescript-eslint/no-unused-vars, prefer-const, @typescript-eslint/no-unnecessary-type-assertion */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { BannerService } from '../services/bannerService';

interface Slide {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

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
  const [rotateEnabled, setRotateEnabled] = useState(true); // Start enabled
  const visibilityRef = useRef(typeof document !== 'undefined' ? document.visibilityState : 'visible');
  const interactionTimer = useRef<NodeJS.Timeout | null>(null);

  // Load banners from DB
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const banners = await BannerService.list();
        const activeOnes = (banners || []).filter((b) => b.isActive);
        const mapped: Slide[] = activeOnes.map((b) => ({
          id: b.id,
          image: b.imageUrl,
          title: b.title,
          subtitle: b.subtitle,
          ctaText: b.linkUrl ? (b as any).ctaText || 'Lihat' : undefined,
          ctaLink: b.linkUrl,
        }));
        if (mounted) setDbSlides(mapped.length > 0 ? mapped : []);
      } catch (e) {
        if (mounted) setDbSlides([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const resolvedSlides = (dbSlides && dbSlides.length > 0)
    ? dbSlides
    : (slides && slides.length > 0 ? slides : defaultSlides);

  const count = Math.min(resolvedSlides.length, 5); // Allow up to 5 banners

  const nextSlide = useCallback(() => {
    setIndex((i) => (i + 1) % count);
  }, [count]);

  const prevSlide = () => {
    setIndex((i) => (i - 1 + count) % count);
  };
  
  // Manual interaction handler
  const handleInteraction = (action: () => void) => {
    action();
    setRotateEnabled(false);
    if (interactionTimer.current) clearTimeout(interactionTimer.current);
    interactionTimer.current = setTimeout(() => {
      setRotateEnabled(true);
    }, 10000); // Resume auto-rotation after 10s of inactivity
  };

  // Track page visibility to pause rotation when hidden
  useEffect(() => {
    const onVisibility = () => {
      visibilityRef.current = document.visibilityState;
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Auto-rotation logic
  useEffect(() => {
    if (!rotateEnabled || count <= 1 || visibilityRef.current !== 'visible') return;

    const id = setInterval(nextSlide, 5000);
    return () => clearInterval(id);
  }, [count, rotateEnabled, nextSlide]);

  if (count === 0) return null;

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-pink-500/20 group bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-sm">
      <div className="relative w-full aspect-[3/2] overflow-hidden">
        {/* Animated background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-transparent animate-pulse opacity-50" />
        
        {resolvedSlides.slice(0, count).map((slide, i) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out transform ${
              i === index 
                ? 'opacity-100 z-10 scale-100' 
                : 'opacity-0 z-0 scale-105'
            }`}
            aria-hidden={i !== index}
          >
            <img
              src={slide.image}
              alt={slide.title || 'Banner'}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              fetchPriority={i === 0 ? 'high' : 'auto'}
              loading={i === 0 ? 'eager' : 'lazy'}
              width={1200}
              height={800}
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-500" />
          </div>
        ))}

        <div className="absolute inset-0 p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-end z-30">
          <div className="text-white max-w-full sm:max-w-md lg:max-w-2xl transform transition-all duration-500 group-hover:translate-y-[-4px]">
            {resolvedSlides[index]?.title && (
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 leading-tight bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent drop-shadow-2xl animate-fadeIn">
                {resolvedSlides[index].title}
              </h3>
            )}
            {resolvedSlides[index]?.subtitle && (
              <p className="text-white/95 mb-4 sm:mb-5 md:mb-6 text-sm sm:text-base md:text-lg leading-relaxed drop-shadow-lg animate-fadeIn animation-delay-150">
                {resolvedSlides[index].subtitle}
              </p>
            )}
            {resolvedSlides[index]?.ctaText && resolvedSlides[index]?.ctaLink && (
              <a 
                href={resolvedSlides[index].ctaLink} 
                className="inline-flex items-center justify-center bg-gradient-to-r from-pink-600 via-pink-500 to-purple-600 hover:from-pink-700 hover:via-pink-600 hover:to-purple-700 text-white px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 shadow-2xl hover:shadow-pink-500/25 transform hover:scale-105 hover:-translate-y-1 animate-fadeIn animation-delay-300 backdrop-blur-sm border border-white/20"
              >
                <span className="relative z-10">{resolvedSlides[index].ctaText}</span>
                <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced pagination dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-3 z-30">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => handleInteraction(() => setIndex(i))}
            className={`relative h-3 rounded-full transition-all duration-500 ease-out transform hover:scale-110 ${
              i === index 
                ? 'w-8 bg-gradient-to-r from-pink-400 to-purple-400 shadow-lg shadow-pink-500/50' 
                : 'w-3 bg-white/60 hover:bg-white/80'
            }`}
          >
            {i === index && (
              <div className="absolute inset-0 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full animate-pulse opacity-75" />
            )}
          </button>
        ))}
      </div>

      {/* Enhanced navigation arrows */}
      {count > 1 && (
        <>
          <button
            onClick={() => handleInteraction(prevSlide)}
            aria-label="Previous slide"
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-black/40 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gradient-to-r hover:from-pink-600/80 hover:to-purple-600/80 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-400 border border-white/20"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => handleInteraction(nextSlide)}
            aria-label="Next slide"
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-black/40 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gradient-to-r hover:from-pink-600/80 hover:to-purple-600/80 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-400 border border-white/20"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
      
      {/* Progress indicator */}
      {count > 1 && (
        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500 z-30 transition-all duration-5000 ease-linear"
          style={{ width: `${((index + 1) / count) * 100}%` }}
        />
      )}
    </div>
  );
};

export default BannerCarousel;
