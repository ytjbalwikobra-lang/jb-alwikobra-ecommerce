import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface MobileNavItemProps {
  path: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  hasNotification?: boolean;
}

export const MobileNavItem: React.FC<MobileNavItemProps> = ({
  path,
  label,
  icon: Icon,
  isActive,
  hasNotification = false
}) => {
  return (
    <Link
      to={path}
      className={`flex flex-col items-center py-2 px-3 rounded-lg text-xs font-medium transition-all duration-300 group ${
        isActive 
          ? 'text-pink-400 bg-pink-500/10' 
          : 'text-gray-300 hover:text-pink-300 hover:bg-white/5'
      }`}
    >
      <div className="relative mb-1">
        <Icon 
          size={20} 
          className={`transition-transform duration-300 ${
            isActive ? 'scale-110' : 'group-hover:scale-105'
          }`}
        />
        {hasNotification && !isActive && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full animate-pulse shadow-lg shadow-pink-500/50" />
        )}
      </div>
      <span className={`transition-all duration-300 ${
        isActive ? 'text-pink-400 font-semibold' : 'group-hover:text-pink-300'
      }`}>
        {label}
      </span>
      {isActive && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"></div>
      )}
    </Link>
  );
};
