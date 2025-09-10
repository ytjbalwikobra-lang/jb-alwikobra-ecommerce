import { useState, useEffect, useCallback } from 'react';

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

export interface UseSettingsPageReturn {
  settings: AppSettings;
  updateTheme: (theme: AppSettings['theme']) => void;
  updateLanguage: (language: AppSettings['language']) => void;
  updateNotification: (key: keyof AppSettings['notifications'], value: boolean) => void;
  updatePrivacy: (key: keyof AppSettings['privacy'], value: boolean) => void;
  saveSettings: () => void;
}

const defaultSettings: AppSettings = {
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
};

export const useSettingsPage = (): UseSettingsPageReturn => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const loadSettings = useCallback(() => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings) as AppSettings;
        setSettings(parsed);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = useCallback(() => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings));
      alert('Pengaturan berhasil disimpan');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Gagal menyimpan pengaturan');
    }
  }, [settings]);

  const updateTheme = useCallback((theme: AppSettings['theme']) => {
    setSettings(prev => ({ ...prev, theme }));
  }, []);

  const updateLanguage = useCallback((language: AppSettings['language']) => {
    setSettings(prev => ({ ...prev, language }));
  }, []);

  const updateNotification = useCallback((key: keyof AppSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  }, []);

  const updatePrivacy = useCallback((key: keyof AppSettings['privacy'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  }, []);

  return {
    settings,
    updateTheme,
    updateLanguage,
    updateNotification,
    updatePrivacy,
    saveSettings
  };
};
