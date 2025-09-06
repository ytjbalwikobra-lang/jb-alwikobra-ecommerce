import React, { useEffect, useState } from 'react';
import { BannerService } from '../services/bannerService.ts';
import ResponsiveImage from './ResponsiveImage.tsx';

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

  // Load banners from DB; if none, fall back to provided slides or defaults
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

  const count = Math.min(resolvedSlides.length, 3);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % (count || 1)), 5000);
    return () => clearInterval(id);
  }, [count]);

  if (count === 0) return null;

  const active = resolvedSlides[index];

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-md border border-pink-500/40">
      {/* Mobile-optimized aspect ratio using CSS */}
      <div className="relative w-full">
        {/* Mobile: 16:9 ratio */}
        <div className="block md:hidden w-full" style={{ paddingTop: '56.25%' }}>
          <ResponsiveImage
            src={active.image}
            alt={active.title || 'Banner'}
            className="absolute inset-0 w-full h-full object-cover"
            priority={true}
            quality={90}
            aspectRatio={16/9}
            sizes="100vw"
          />
        </div>
        
        {/* Desktop: 3:2 ratio */}
        <div className="hidden md:block w-full" style={{ paddingTop: '66.6667%' }}>
          <ResponsiveImage
            src={active.image}
            alt={active.title || 'Banner'}
            className="absolute inset-0 w-full h-full object-cover"
            priority={true}
            quality={90}
            aspectRatio={3/2}
            sizes="(max-width: 1024px) 90vw, 80vw"
          />
        </div>

        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Content positioned responsively */}
        <div className="absolute inset-0 p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-end">
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
                  className="inline-block bg-pink-500 hover:bg-pink-600 text-white px-3 sm:px-4 md:px-5 py-2 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  {active.ctaText}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dots indicator - positioned better for mobile */}
      <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 sm:space-x-2">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2 sm:h-2.5 rounded-full transition-all duration-200 ${
              i === index 
                ? 'w-4 sm:w-6 bg-white shadow-lg' 
                : 'w-2 sm:w-2.5 bg-white/70 hover:bg-white/90'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
