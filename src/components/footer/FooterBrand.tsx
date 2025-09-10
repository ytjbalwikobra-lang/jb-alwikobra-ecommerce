import React from 'react';

interface FooterBrandProps {
  siteName: string;
  logoUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
}

export const FooterBrand: React.FC<FooterBrandProps> = ({
  siteName,
  logoUrl,
  facebookUrl,
  instagramUrl,
  tiktokUrl,
  youtubeUrl
}) => {
  return (
    <div className="col-span-1 md:col-span-2">
      <div className="flex items-center space-x-2 mb-4">
        {logoUrl ? (
          <img 
            src={logoUrl} 
            alt={siteName} 
            className="w-8 h-8 rounded-lg object-cover hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300"
          />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300 hover:scale-105">
            <span className="text-white font-bold text-sm">JB</span>
          </div>
        )}
        <div>
          <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            {siteName}
          </span>
          <p className="text-sm text-gray-400 -mt-1">Gaming Marketplace</p>
        </div>
      </div>
      
      <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
        Platform terpercaya untuk jual beli dan rental akun game di Indonesia. 
        Dapatkan akun game impian Anda dengan harga terbaik dan layanan terpercaya.
      </p>
      
      <div className="flex space-x-4">
        {/* Instagram */}
        <a 
          href={instagramUrl} 
          target="_blank" 
          rel="noreferrer" 
          className="group text-gray-400 hover:text-pink-300 transition-all duration-300 hover:scale-110" 
          aria-label="Instagram"
        >
          <div className="p-2 rounded-lg hover:bg-pink-500/10 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h10zm-5 3a5 5 0 1 0 .001 10.001A5 5 0 0 0 12 7zm0 2a3 3 0 1 1-.001 6.001A3 3 0 0 1 12 9zm5.5-.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5z"/>
            </svg>
          </div>
        </a>
        
        {/* Facebook */}
        <a 
          href={facebookUrl} 
          target="_blank" 
          rel="noreferrer" 
          className="group text-gray-400 hover:text-blue-300 transition-all duration-300 hover:scale-110" 
          aria-label="Facebook"
        >
          <div className="p-2 rounded-lg hover:bg-blue-500/10 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 12a10 10 0 1 0-11.5 9.95v-7.04H7.9V12h2.6V9.8c0-2.57 1.53-4 3.87-4 1.12 0 2.3.2 2.3.2v2.53h-1.3c-1.28 0-1.68.8-1.68 1.62V12h2.85l-.46 2.91h-2.39v7.04A10 10 0 0 0 22 12z"/>
            </svg>
          </div>
        </a>
        
        {/* TikTok */}
        <a 
          href={tiktokUrl} 
          target="_blank" 
          rel="noreferrer" 
          className="group text-gray-400 hover:text-pink-300 transition-all duration-300 hover:scale-110" 
          aria-label="TikTok"
        >
          <div className="p-2 rounded-lg hover:bg-pink-500/10 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 8.5a7.5 7.5 0 0 1-5-2v8.2a5.7 5.7 0 1 1-4.9-5.65v2.7a3 3 0 1 0 2 2.83V2h3a4.5 4.5 0 0 0 4 3.9v2.6z"/>
            </svg>
          </div>
        </a>
        
        {/* YouTube */}
        <a 
          href={youtubeUrl} 
          target="_blank" 
          rel="noreferrer" 
          className="group text-gray-400 hover:text-red-300 transition-all duration-300 hover:scale-110" 
          aria-label="YouTube"
        >
          <div className="p-2 rounded-lg hover:bg-red-500/10 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .6 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.3.6 9.3.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8zM9.8 15.5V8.5l6.3 3.5-6.3 3.5z"/>
            </svg>
          </div>
        </a>
      </div>
    </div>
  );
};
