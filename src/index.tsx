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
      inject: (..._args: any[]) => {
        // Provide a harmless return to satisfy no-empty-function
        return { renderer: 'noop' } as any;
      },
      onCommitFiberRoot: (..._args: any[]) => {
        // Intentionally no-op
        return undefined;
      },
      onCommitFiberUnmount: (..._args: any[]) => {
        // Intentionally no-op
        return undefined;
      },
    };
  }
}

// Initialize performance monitoring
initWebVitalsMonitoring();

// Font optimization disabled to prevent preload warnings
// FontOptimizer.preloadCriticalFonts();

// Inject critical CSS before any rendering
injectCriticalCSS();
preloadCriticalResources();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
