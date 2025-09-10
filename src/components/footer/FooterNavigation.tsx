import React from 'react';
import { Link } from 'react-router-dom';

export const FooterNavigation: React.FC = () => {
  const navigationLinks = [
    { to: '/', label: 'Beranda' },
    { to: '/flash-sales', label: 'Flash Sale' },
    { to: '/products', label: 'Katalog Produk' },
    { to: '/sell', label: 'Jual Akun' },
    { to: '/help', label: 'Bantuan' },
    { to: '/terms', label: 'Syarat & Ketentuan' }
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
        Menu Utama
      </h3>
      <ul className="space-y-3">
        {navigationLinks.map((link) => (
          <li key={link.to}>
            <Link 
              to={link.to} 
              className="group text-gray-300 hover:text-pink-300 transition-all duration-300 flex items-center"
            >
              <span className="relative">
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
