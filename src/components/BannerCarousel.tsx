import React, { useEffect, useState } from 'react';

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

const BannerCarousel: React.FC<Props> = ({ slides = defaultSlides }) => {
  const [index, setIndex] = useState(0);
  const count = Math.min(slides.length, 3);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(id);
  }, [count]);

  if (count === 0) return null;

  const active = slides[index];

  return (
  <div className="relative rounded-2xl overflow-hidden shadow-md border border-pink-500/40">
      {/* 3:2 ratio container */}
      <div className="relative w-full" style={{ paddingTop: '66.6667%' }}>
        <img
          src={active.image}
          alt={active.title || 'Banner'}
          className="absolute inset-0 w-full h-full object-cover"
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
