/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import React, { useEffect, useRef, useState } from 'react';

interface HorizontalScrollerProps {
  children: React.ReactNode;
  ariaLabel?: string;
  className?: string;
  itemGapClass?: string; // e.g., 'gap-4'
  scrollBy?: number; // pixels to scroll per click; if not provided, uses container width * 0.9
  showButtons?: boolean;
}

const HorizontalScroller: React.FC<HorizontalScrollerProps> = ({
  children,
  ariaLabel = 'Daftar',
  className = '',
  itemGapClass = 'gap-4',
  scrollBy,
  showButtons = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showRightFade, setShowRightFade] = useState(true);

  const handleScroll = (dir: 'prev' | 'next') => {
    const el = containerRef.current;
    if (!el) return;
    const delta = scrollBy ?? Math.floor(el.clientWidth * 0.9);
    const to = dir === 'next' ? el.scrollLeft + delta : el.scrollLeft - delta;
    el.scrollTo({ left: to, behavior: 'smooth' });
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      // Hide if there is no overflow or we are at the far right
      setShowRightFade(maxScrollLeft > 1 && el.scrollLeft < maxScrollLeft - 1);
    };

    let rafId: number | null = null;
    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId as number);
      rafId = requestAnimationFrame(update);
    };

    update();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [children]);

  return (
    <div className={`relative group ${className}`} aria-label={ariaLabel}>
      {showButtons && (
        <>
          <button
            aria-label="Scroll left"
            onClick={() => handleScroll('prev')}
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-pink-600/90 to-purple-600/90 backdrop-blur-sm border border-white/20 text-white hover:from-pink-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-pink-500/25 hover:scale-110 opacity-80 group-hover:opacity-100 transform hover:-translate-x-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            aria-label="Scroll right"
            onClick={() => handleScroll('next')}
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-pink-600/90 to-purple-600/90 backdrop-blur-sm border border-white/20 text-white hover:from-pink-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-pink-500/25 hover:scale-110 opacity-80 group-hover:opacity-100 transform hover:translate-x-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Enhanced edge fade with gradient */}
      <div
        className={`pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-gray-900 via-gray-900/60 to-transparent z-10 transition-opacity duration-300 ${
          showRightFade ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {/* Left edge fade for better visual balance */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-gray-900/40 to-transparent z-10 opacity-50" />

      <div
        ref={containerRef}
        className={`no-scrollbar flex ${itemGapClass} overflow-x-auto pb-3 snap-x snap-mandatory scroll-smooth`}
        style={{ scrollPaddingLeft: '1rem', scrollPaddingRight: '1rem' }}
      >
        {children}
      </div>
      
      {/* Subtle bottom gradient for depth */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
    </div>
  );
};

export default HorizontalScroller;
