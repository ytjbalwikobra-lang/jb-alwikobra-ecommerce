// Critical CSS for above-the-fold content
export const criticalCSS = `
/* Reset and base styles */
*,*::before,*::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}
*::before,*::after{--tw-content:''}
html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal}
body{margin:0;line-height:inherit}

/* Layout essentials */
.relative{position:relative}
.absolute{position:absolute}
.inset-0{inset:0px}
.flex{display:flex}
.hidden{display:none}
.h-full{height:100%}
.w-full{width:100%}
.min-h-screen{min-height:100vh}
.items-center{align-items:center}
.justify-center{justify-content:center}
.justify-between{justify-content:space-between}
.overflow-hidden{overflow:hidden}
.rounded-2xl{border-radius:1rem}
.bg-gray-900{--tw-bg-opacity:1;background-color:rgb(17 24 39 / var(--tw-bg-opacity))}
.bg-white{--tw-bg-opacity:1;background-color:rgb(255 255 255 / var(--tw-bg-opacity))}
.text-white{--tw-text-opacity:1;color:rgb(255 255 255 / var(--tw-text-opacity))}

/* Loading spinner */
.animate-spin{animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* Critical component styles */
.loading-spinner{
  width:2rem;
  height:2rem;
  border:2px solid transparent;
  border-top:2px solid currentColor;
  border-radius:50%;
  animation:spin 1s linear infinite;
}

/* Header essentials */
.header-container{
  background:linear-gradient(135deg,#ec4899,#f97316);
  padding:1rem;
  box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1);
}

/* Navigation */
.nav-link{
  padding:0.5rem 1rem;
  border-radius:0.5rem;
  transition:background-color 0.2s;
}
.nav-link:hover{
  background-color:rgba(255,255,255,0.1);
}

@media (min-width: 640px) {
  .sm\\:block{display:block}
  .sm\\:hidden{display:none}
  .sm\\:p-6{padding:1.5rem}
}
`;

// Function to inject critical CSS
export const injectCriticalCSS = () => {
  if (typeof document === 'undefined') return;
  
  const existingStyle = document.getElementById('critical-css');
  if (existingStyle) return;
  
  const style = document.createElement('style');
  style.id = 'critical-css';
  style.innerHTML = criticalCSS;
  document.head.insertBefore(style, document.head.firstChild);
};

// Preload key resources
export const preloadCriticalResources = () => {
  if (typeof document === 'undefined') return;
  
  const resources = [
    { href: '/manifest.json', as: 'fetch', crossorigin: 'anonymous' },
    { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', as: 'style' }
  ];
  
  resources.forEach(resource => {
    const existing = document.querySelector(`link[href="${resource.href}"]`);
    if (existing) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    if (resource.crossorigin) link.crossOrigin = resource.crossorigin;
    document.head.appendChild(link);
  });
};
