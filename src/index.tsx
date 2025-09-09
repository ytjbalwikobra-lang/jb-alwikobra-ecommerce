import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { injectCriticalCSS, preloadCriticalResources } from './utils/criticalCSS';
import { initWebVitalsMonitoring } from './utils/webVitalsMonitor';
import { FontOptimizer } from './utils/fontOptimizer';

// Suppress React DevTools warning in development
if (process.env.NODE_ENV === 'development') {
  // Silence React DevTools download suggestion
  if (typeof window !== 'undefined') {
    (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      isDisabled: false,
      supportsFiber: true,
      inject: () => {},
      onCommitFiberRoot: () => {},
      onCommitFiberUnmount: () => {},
    };
  }
}

// Initialize performance monitoring (idle)
requestIdleCallback?.(() => initWebVitalsMonitoring());

// Font optimization disabled to prevent preload warnings
// FontOptimizer.preloadCriticalFonts();

// Inject critical CSS before any rendering
injectCriticalCSS();
// Preload only safe critical resources
preloadCriticalResources?.();
// Optionally warm fonts in idle to avoid layout shift
requestIdleCallback?.(() => FontOptimizer.preloadCriticalFonts?.());

const container = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(container);
// Minimal loading placeholder until first paint
if (!container.hasChildNodes()) {
  container.innerHTML = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#000;color:#ccc;font:14px system-ui,sans-serif">Loading…</div>';
}
// Set dynamic vh to handle mobile browser chrome
const setVh = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};
setVh();
window.addEventListener('resize', setVh);
window.addEventListener('orientationchange', setVh);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
// Cleanup listeners on HMR/dev
if ((import.meta as any)?.hot) {
  (import.meta as any).hot.dispose(() => {
    window.removeEventListener('resize', setVh);
    window.removeEventListener('orientationchange', setVh);
  });
}
