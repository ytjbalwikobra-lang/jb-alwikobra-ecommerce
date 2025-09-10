import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

export const SettingsHeader: React.FC = () => {
  return (
    <div className="flex items-center space-x-4 mb-8">
      <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center">
        <SettingsIcon size={24} className="text-white" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-white">Pengaturan</h1>
        <p className="text-gray-400">Kelola preferensi aplikasi Anda</p>
      </div>
    </div>
  );
};
