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
      {/* 3:2 ratio container */}
      <div className="relative w-full" style={{ paddingTop: '66.6667%' }}>
        <ResponsiveImage
          src={active.image}
          alt={active.title || 'Banner'}
          className="absolute inset-0 w-full h-full"
          priority={true} // Banners are above the fold
          quality={90}
          aspectRatio={3/2}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw"
        />

        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end">
          {(active.title || active.subtitle) && (
            <div className="text-white max-w-xl">
              {active.title && <h3 className="text-2xl sm:text-3xl font-bold mb-2">{active.title}</h3>}
              {active.subtitle && <p className="text-white/90 mb-4">{active.subtitle}</p>}
              {active.ctaText && active.ctaLink && (
                <a href={active.ctaLink} className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg font-semibold">
                  {active.ctaText}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-2.5 bg-white/70'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
