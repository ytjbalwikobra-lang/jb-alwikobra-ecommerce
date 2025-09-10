import React from 'react';
import { 
  FooterBrand, 
  FooterNavigation, 
  FooterContact, 
  FooterBottom, 
  useFooterSettings 
} from './footer/index';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { settings, isLoading } = useFooterSettings();

  if (isLoading) {
    return (
      <footer className="bg-gradient-to-br from-black via-gray-900 to-black text-gray-300 border-t border-pink-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 md:pb-12">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="h-8 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg mb-4"></div>
                <div className="h-20 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg mb-4"></div>
                <div className="flex space-x-4">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="w-8 h-8 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div>
                <div className="h-6 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg mb-4"></div>
                <div className="space-y-3">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="h-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div>
                <div className="h-6 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg mb-4"></div>
                <div className="space-y-3">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="h-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gradient-to-br from-black via-gray-900 to-black text-gray-300 border-t border-pink-500/30 relative overflow-hidden">
      {/* Enhanced background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-500/5 to-purple-500/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 md:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          <FooterBrand
            siteName={settings.siteName}
            logoUrl={settings.logoUrl}
            facebookUrl={settings.facebookUrl}
            instagramUrl={settings.instagramUrl}
            tiktokUrl={settings.tiktokUrl}
            youtubeUrl={settings.youtubeUrl}
          />
          
          <FooterNavigation />
          
          <FooterContact
            whatsappNumber={settings.whatsappNumber}
            contactPhone={settings.contactPhone}
            contactEmail={settings.contactEmail}
            address={settings.address}
          />
        </div>

        <FooterBottom siteName={settings.siteName} currentYear={currentYear} />
      </div>
    </footer>
  );
};

export default Footer;
