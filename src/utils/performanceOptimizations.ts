// React Performance Optimization Configuration
// This file contains critical performance improvements for mobile devices

import { StrictMode } from 'react';

// Preload critical chunks for better perceived performance
export const preloadCriticalChunks = () => {
  // Preload the most commonly visited pages after HomePage
  import { lazy } from 'react';

// Remove incorrect imports and use existing pages
const HomePage = lazy(() => import('../pages/HomePage.tsx'));
const ProductsPage = lazy(() => import('../pages/ProductsPage.tsx'));
const ProfilePage = lazy(() => import('../pages/ProfilePage.tsx'));
  
  // Use requestIdleCallback for better performance
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      criticalChunks.forEach(chunk => {
        chunk().catch(() => {}); // Silently fail if preload fails
      });
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      criticalChunks.forEach(chunk => {
        chunk().catch(() => {});
      });
    }, 2000);
  }
};

// Image loading optimization
export const optimizeImages = () => {
  // Enable modern image formats
  const supportsWebP = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('webp') > -1;
  };

  const supportsAVIF = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/avif').indexOf('avif') > -1;
  };

  // Store in sessionStorage to avoid recalculating
  if (!sessionStorage.getItem('imageFormats')) {
    sessionStorage.setItem('imageFormats', JSON.stringify({
      webp: supportsWebP(),
      avif: supportsAVIF()
    }));
  }
};

// Critical CSS inlining (for above-the-fold content)
export const inlineCriticalCSS = () => {
  const criticalCSS = `
    /* Critical CSS for immediate rendering */
    .bg-app-dark { background-color: #0f0f0f; }
    .text-gray-200 { color: #e5e7eb; }
    .min-h-screen { min-height: 100vh; }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .animate-spin { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;

  // Only inject if not already present
  if (!document.querySelector('#critical-css')) {
    const style = document.createElement('style');
    style.id = 'critical-css';
    style.textContent = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);
  }
};

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.log('Service Worker registration failed:', error);
    }
  }
};

// Performance monitoring
export const initPerformanceMonitoring = () => {
  // Measure Core Web Vitals
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('LCP:', entry.startTime);
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('FID:', entry.processingStart - entry.startTime);
      }
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          console.log('CLS:', entry.value);
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }
};

// Memory management for long-running sessions
export const optimizeMemoryUsage = () => {
  // Clear unnecessary caches periodically
  const clearCaches = () => {
    // Clear image caches that are too large
    const imageCache = sessionStorage.getItem('imageCache');
    if (imageCache && imageCache.length > 50000) { // 50KB limit
      sessionStorage.removeItem('imageCache');
    }

    // Clear old logs
    const logs = localStorage.getItem('appLogs');
    if (logs && logs.length > 100000) { // 100KB limit
      localStorage.removeItem('appLogs');
    }
  };

  // Run cleanup every 5 minutes
  setInterval(clearCaches, 5 * 60 * 1000);
};

// Initialize all optimizations
export const initializePerformanceOptimizations = () => {
  // Run critical optimizations immediately
  inlineCriticalCSS();
  optimizeImages();
  
  // Run after DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      preloadCriticalChunks();
      registerServiceWorker();
      initPerformanceMonitoring();
      optimizeMemoryUsage();
    });
  } else {
    preloadCriticalChunks();
    registerServiceWorker();
    initPerformanceMonitoring();
    optimizeMemoryUsage();
  }
};
