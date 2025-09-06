import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { injectCriticalCSS, preloadCriticalResources } from './utils/criticalCSS.ts';

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
