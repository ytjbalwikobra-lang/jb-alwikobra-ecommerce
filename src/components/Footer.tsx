/* eslint-disable @typescript-eslint/no-floating-promises */
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import { SettingsService } from '../services/settingsService';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [siteName, setSiteName] = React.useState<string>('JB Alwikobra');
  const [logoUrl, setLogoUrl] = React.useState<string>('');
  const [whatsappNumber, setWhatsappNumber] = React.useState<string>(process.env.REACT_APP_WHATSAPP_NUMBER || '6281234567890');
  const [contactEmail, setContactEmail] = React.useState<string>('admin@jbalwikobra.com');
  const [contactPhone, setContactPhone] = React.useState<string>('');
  const [address, setAddress] = React.useState<string>('Jakarta, Indonesia');
  const [facebookUrl, setFacebookUrl] = React.useState<string>('https://facebook.com/');
  const [instagramUrl, setInstagramUrl] = React.useState<string>('https://instagram.com/');
  const [tiktokUrl, setTiktokUrl] = React.useState<string>('https://tiktok.com/');
  const [youtubeUrl, setYoutubeUrl] = React.useState<string>('https://youtube.com/');

  React.useEffect(() => {
    (async () => {
      try {
        const s = await SettingsService.get();
        if (s?.siteName) setSiteName(s.siteName);
        if (s?.logoUrl) setLogoUrl(s.logoUrl);
        if (s?.whatsappNumber) setWhatsappNumber(s.whatsappNumber);
        if (s?.contactEmail) setContactEmail(s.contactEmail);
        if (s?.contactPhone) setContactPhone(s.contactPhone);
        if (s?.address) setAddress(s.address);
        if (s?.facebookUrl) setFacebookUrl(s.facebookUrl);
        if (s?.instagramUrl) setInstagramUrl(s.instagramUrl);
        if (s?.tiktokUrl) setTiktokUrl(s.tiktokUrl);
        if (s?.youtubeUrl) setYoutubeUrl(s.youtubeUrl);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    })();
  }, []);

  return (
  <footer className="bg-black text-gray-300 border-t border-pink-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 md:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={siteName} 
                  className="w-8 h-8 rounded-lg object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">JB</span>
                </div>
              )}
              <div>
                <span className="text-xl font-bold">{siteName}</span>
                <p className="text-sm text-gray-400 -mt-1">Gaming Marketplace</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Platform terpercaya untuk jual beli dan rental akun game di Indonesia. 
              Dapatkan akun game impian Anda dengan harga terbaik dan layanan terpercaya.
            </p>
            <div className="flex space-x-4">
              {/* Instagram */}
              <a href={instagramUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-300 transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h10zm-5 3a5 5 0 1 0 .001 10.001A5 5 0 0 0 12 7zm0 2a3 3 0 1 1-.001 6.001A3 3 0 0 1 12 9zm5.5-.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5z"/></svg>
              </a>
              {/* Facebook */}
              <a href={facebookUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-300 transition-colors" aria-label="Facebook">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.5 9.95v-7.04H7.9V12h2.6V9.8c0-2.57 1.53-4 3.87-4 1.12 0 2.3.2 2.3.2v2.53h-1.3c-1.28 0-1.68.8-1.68 1.62V12h2.85l-.46 2.91h-2.39v7.04A10 10 0 0 0 22 12z"/></svg>
              </a>
              {/* TikTok */}
              <a href={tiktokUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-300 transition-colors" aria-label="TikTok">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M21 8.5a7.5 7.5 0 0 1-5-2v8.2a5.7 5.7 0 1 1-4.9-5.65v2.7a3 3 0 1 0 2 2.83V2h3a4.5 4.5 0 0 0 4 3.9v2.6z"/></svg>
              </a>
              {/* YouTube */}
              <a href={youtubeUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-300 transition-colors" aria-label="YouTube">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .6 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.3.6 9.3.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8zM9.8 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Menu Utama</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/flash-sales" className="text-gray-300 hover:text-pink-300 transition-colors">
                  Flash Sale
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-pink-300 transition-colors">
                  Katalog Produk
                </Link>
              </li>
              <li>
                <Link to="/sell" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Jual Akun
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-gray-300 hover:text-pink-300 transition-colors">
                  Bantuan
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-pink-300 transition-colors">
                  Syarat & Ketentuan
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontak</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-gray-300">
                <Phone size={16} />
                <span>+{whatsappNumber}</span>
              </li>
              {contactPhone && (
                <li className="flex items-center space-x-2 text-gray-300">
                  <Phone size={16} />
                  <span>{contactPhone}</span>
                </li>
              )}
              <li className="flex items-center space-x-2 text-gray-300">
                <Mail size={16} />
                <span>{contactEmail}</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-300">
                <MapPin size={16} />
                <span>{address}</span>
              </li>
            </ul>
          </div>
        </div>

  <div className="border-t border-pink-500/30 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm text-center md:text-left">
            © {currentYear} {siteName}. All rights reserved.
          </p>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 text-gray-400 text-sm mt-4 md:mt-0">
            <Link to="/terms" className="hover:text-pink-300">Syarat & Ketentuan</Link>
            <span className="opacity-50 hidden sm:inline">|</span>
            <div className="flex items-center space-x-2">
              <span>Made with</span>
              <Heart size={14} className="text-primary-500" />
              <span>for Indonesian Gamers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
