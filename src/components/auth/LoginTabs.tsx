import React from 'react';

interface LoginTabsProps {
  activeTab: 'email' | 'phone';
  onTabChange: (tab: 'email' | 'phone') => void;
}

export const LoginTabs: React.FC<LoginTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex bg-black/40 rounded-lg p-1 mb-6">
      <button
        type="button"
        onClick={() => onTabChange('email')}
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
          activeTab === 'email'
            ? 'bg-pink-600 text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        Email
      </button>
      <button
        type="button"
        onClick={() => onTabChange('phone')}
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
          activeTab === 'phone'
            ? 'bg-pink-600 text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        WhatsApp
      </button>
    </div>
  );
};
