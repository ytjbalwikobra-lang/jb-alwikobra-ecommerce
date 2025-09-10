import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Bell,
  Moon,
  Shield,
  Save,
} from 'lucide-react';
import Footer from '../components/Footer';
import { AuthRequired } from '../components/ProtectedRoute';
import { useTheme } from '../contexts/ThemeContext';

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
  const { mode, setMode } = useTheme();
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    language: 'id',
    notifications: {
      email: true,
      whatsapp: true,
      push: false,
    },
    privacy: {
      showProfile: true,
      showOrders: false,
      allowMarketing: true,
    },
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings) as AppSettings);
    } else {
      // initialize theme from provider mode on first load
      setSettings((prev) => ({ ...prev, theme: mode }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    alert('Pengaturan berhasil disimpan');
  };

  const updateNotification = (
    key: keyof AppSettings['notifications'],
    value: boolean,
  ) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const updatePrivacy = (key: keyof AppSettings['privacy'], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }));
  };

  return (
    <AuthRequired>
      <div className="min-h-screen bg-app-bg">
        <div className="pt-20 pb-20 px-4 with-bottom-nav">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-8">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    'linear-gradient(135deg, var(--accent) 0%, rgba(236, 72, 153, 0.6) 100%)',
                  boxShadow: '0 10px 30px rgba(236, 72, 153, 0.25)',
                }}
              >
                <SettingsIcon size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-app-text">Pengaturan</h1>
                <p className="text-app-muted">Kelola preferensi aplikasi Anda</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Theme Settings */}
              <div className="bg-app-surface backdrop-blur rounded-2xl p-6 border border-app-border">
                <h2 className="text-xl font-semibold text-app-text mb-6 flex items-center">
                  <Moon size={20} className="mr-3 text-app-accent" />
                  Tampilan
                </h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-app-text">Tema</span>
                    <select
                      value={settings.theme}
                      onChange={(e) => {
                        const next = e.target.value as AppSettings['theme'];
                        setSettings((prev) => ({ ...prev, theme: next }));
                        setMode(next);
                      }}
                      className="bg-app-surface2 border border-app-border rounded-lg px-3 py-2 text-app-text"
                    >
                      <option value="dark">Gelap</option>
                      <option value="light">Terang</option>
                      <option value="auto">Otomatis</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-app-text">Bahasa</span>
                    <select
                      value={settings.language}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          language: e.target.value as AppSettings['language'],
                        }))
                      }
                      className="bg-app-surface2 border border-app-border rounded-lg px-3 py-2 text-app-text"
                    >
                      <option value="id">Indonesia</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="bg-app-surface backdrop-blur rounded-xl p-6 border border-app-border">
                <h2 className="text-lg font-semibold text-app-text mb-4 flex items-center">
                  <Bell size={20} className="mr-2" />
                  Notifikasi
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-app-text">Email</div>
                      <div className="text-app-muted text-sm">
                        Notifikasi pesanan dan promo via email
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.email}
                        onChange={(e) =>
                          updateNotification('email', e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-app-surface2 border border-app-border relative rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-app-accent"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-app-text">WhatsApp</div>
                      <div className="text-app-muted text-sm">
                        Konfirmasi pesanan via WhatsApp
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.whatsapp}
                        onChange={(e) =>
                          updateNotification('whatsapp', e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-app-surface2 border border-app-border relative rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-app-accent"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-app-text">Push Notification</div>
                      <div className="text-app-muted text-sm">
                        Notifikasi browser (coming soon)
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.push}
                        onChange={(e) =>
                          updateNotification('push', e.target.checked)
                        }
                        className="sr-only peer"
                        disabled
                      />
                      <div className="w-11 h-6 bg-app-surface2 border border-app-border relative rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-app-accent opacity-50"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="bg-app-surface backdrop-blur rounded-xl p-6 border border-app-border">
                <h2 className="text-lg font-semibold text-app-text mb-4 flex items-center">
                  <Shield size={20} className="mr-2" />
                  Privasi
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-app-text">Profil Publik</div>
                      <div className="text-app-muted text-sm">
                        Tampilkan profil di leaderboard
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacy.showProfile}
                        onChange={(e) =>
                          updatePrivacy('showProfile', e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-app-surface2 border border-app-border relative rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-app-accent"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-app-text">Riwayat Pesanan</div>
                      <div className="text-app-muted text-sm">
                        Sembunyikan riwayat pesanan dari publik
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacy.showOrders}
                        onChange={(e) =>
                          updatePrivacy('showOrders', e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-app-surface2 border border-app-border relative rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-app-accent"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-app-text">Email Marketing</div>
                      <div className="text-app-muted text-sm">
                        Terima email promo dan penawaran
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacy.allowMarketing}
                        onChange={(e) =>
                          updatePrivacy('allowMarketing', e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-app-surface2 border border-app-border relative rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-app-accent"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={saveSettings}
                className="w-full bg-app-accent hover:opacity-90 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-pink-500/20"
              >
                <Save size={20} />
                <span>Simpan Pengaturan</span>
              </button>

              {/* App Info */}
              <div className="bg-app-surface2 backdrop-blur rounded-xl p-4 border border-app-border text-center">
                <div className="text-app-muted text-sm">
                  JB Alwikobra E-commerce v1.0.0
                </div>
                <div className="text-app-muted text-xs mt-1 opacity-70">
                  © 2024 All rights reserved
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </AuthRequired>
  );
};

export default SettingsPage;
