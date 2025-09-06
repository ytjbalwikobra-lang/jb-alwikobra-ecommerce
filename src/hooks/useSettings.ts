import { useState, useEffect } from 'react';
import { SettingsService } from '../services/settingsService.ts';
import { WebsiteSettings } from '../types/index.ts';

export const useSettings = () => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await SettingsService.get();
        setSettings(data);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  return { settings, loading, refreshSettings: () => setLoading(true) };
};
