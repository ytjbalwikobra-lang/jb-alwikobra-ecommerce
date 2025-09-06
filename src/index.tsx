import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { injectCriticalCSS, preloadCriticalResources } from './utils/criticalCSS.ts';
import { initWebVitalsMonitoring } from './utils/webVitalsMonitor.ts';
import { FontOptimizer } from './utils/fontOptimizer.ts';

// Initialize performance monitoring
initWebVitalsMonitoring();

// Initialize font optimization
FontOptimizer.preloadCriticalFonts();

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
