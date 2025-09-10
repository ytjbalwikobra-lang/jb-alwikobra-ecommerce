import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

interface FooterBottomProps {
  siteName: string;
  currentYear: number;
}

export const FooterBottom: React.FC<FooterBottomProps> = ({ siteName, currentYear }) => {
  return (
    <div className="border-t border-pink-500/30 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
      <p className="text-gray-400 text-sm text-center md:text-left">
        © {currentYear} {siteName}. All rights reserved.
      </p>
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 text-gray-400 text-sm mt-4 md:mt-0">
        <Link 
          to="/terms" 
          className="hover:text-pink-300 transition-colors duration-300 relative group"
        >
          <span>Syarat & Ketentuan</span>
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
        </Link>
        <span className="opacity-50 hidden sm:inline">|</span>
        <div className="flex items-center space-x-2 group">
          <span>Made with</span>
          <Heart 
            size={14} 
            className="text-pink-500 group-hover:text-pink-400 transition-colors duration-300 group-hover:scale-110 transform" 
          />
          <span>for Indonesian Gamers</span>
        </div>
      </div>
    </div>
  );
};
