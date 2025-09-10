import React from 'react';
import { Moon } from 'lucide-react';

interface AppearanceSettingsProps {
  theme: 'light' | 'dark' | 'auto';
  language: 'id' | 'en';
  onThemeChange: (theme: 'light' | 'dark' | 'auto') => void;
  onLanguageChange: (language: 'id' | 'en') => void;
}

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  theme,
  language,
  onThemeChange,
  onLanguageChange
}) => {
  return (
    <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-6 border border-gray-700/50">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Moon size={20} className="mr-3 text-blue-400" />
        Tampilan
      </h2>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Tema</span>
          <select
            value={theme}
            onChange={(e) => onThemeChange(e.target.value as 'light' | 'dark' | 'auto')}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="dark">Gelap</option>
            <option value="light">Terang</option>
            <option value="auto">Otomatis</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-300">Bahasa</span>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as 'id' | 'en')}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="id">Indonesia</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </div>
  );
};
