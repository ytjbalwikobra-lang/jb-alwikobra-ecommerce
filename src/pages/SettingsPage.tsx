import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Lock, 
  Moon, 
  Sun, 
  Globe, 
  Shield,
  ChevronRight,
  Save
} from 'lucide-react';
import Header from '../components/Header.tsx';
import Footer from '../components/Footer.tsx';

interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'id' | 'en';
  notifications: {
    email: boolean;
    whatsapp: boolean;
    push: boolean;
  };
  privacy: {
    showProfile: boolean;
    showOrders: boolean;
    allowMarketing: boolean;
  };
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    language: 'id',
    notifications: {
      email: true,
      whatsapp: true,
      push: false
    },
    privacy: {
      showProfile: true,
      showOrders: false,
      allowMarketing: true
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const saveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    alert('Pengaturan berhasil disimpan');
  };

  const updateNotification = (key: keyof AppSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const updatePrivacy = (key: keyof AppSettings['privacy'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900">
      <Header />
      
      <div className="pt-20 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <SettingsIcon size={28} className="text-pink-400" />
            <h1 className="text-2xl font-bold text-white">Pengaturan</h1>
          </div>

          <div className="space-y-6">
            {/* Theme Settings */}
            <div className="bg-black/40 backdrop-blur rounded-xl p-6 border border-pink-500/30">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Moon size={20} className="mr-2" />
                Tampilan
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Tema</span>
                  <select
                    value={settings.theme}
                    onChange={(e) => setSettings(prev => ({...prev, theme: e.target.value as any}))}
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
                    value={settings.language}
                    onChange={(e) => setSettings(prev => ({...prev, language: e.target.value as any}))}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="id">Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-black/40 backdrop-blur rounded-xl p-6 border border-pink-500/30">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Bell size={20} className="mr-2" />
                Notifikasi
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white">Email</div>
                    <div className="text-gray-400 text-sm">Notifikasi pesanan dan promo via email</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.email}
                      onChange={(e) => updateNotification('email', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white">WhatsApp</div>
                    <div className="text-gray-400 text-sm">Konfirmasi pesanan via WhatsApp</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.whatsapp}
                      onChange={(e) => updateNotification('whatsapp', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white">Push Notification</div>
                    <div className="text-gray-400 text-sm">Notifikasi browser (coming soon)</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.push}
                      onChange={(e) => updateNotification('push', e.target.checked)}
                      className="sr-only peer"
                      disabled
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500 opacity-50"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-black/40 backdrop-blur rounded-xl p-6 border border-pink-500/30">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Shield size={20} className="mr-2" />
                Privasi
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white">Profil Publik</div>
                    <div className="text-gray-400 text-sm">Tampilkan profil di leaderboard</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.privacy.showProfile}
                      onChange={(e) => updatePrivacy('showProfile', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white">Riwayat Pesanan</div>
                    <div className="text-gray-400 text-sm">Sembunyikan riwayat pesanan dari publik</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.privacy.showOrders}
                      onChange={(e) => updatePrivacy('showOrders', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white">Email Marketing</div>
                    <div className="text-gray-400 text-sm">Terima email promo dan penawaran</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.privacy.allowMarketing}
                      onChange={(e) => updatePrivacy('allowMarketing', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={saveSettings}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Save size={20} />
              <span>Simpan Pengaturan</span>
            </button>

            {/* App Info */}
            <div className="bg-black/20 backdrop-blur rounded-xl p-4 border border-pink-500/20 text-center">
              <div className="text-gray-400 text-sm">
                JB Alwikobra E-commerce v1.0.0
              </div>
              <div className="text-gray-500 text-xs mt-1">
                © 2024 All rights reserved
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SettingsPage;
