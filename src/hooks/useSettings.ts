import { useState, useEffect } from 'react';
import { SettingsService } from '../services/settingsService.ts';
import { WebsiteSettings } from '../types/index.ts';
import { clientCache } from '../services/clientCacheService.ts';

export const useSettings = () => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Use cache for settings with 5 minute TTL
        const data = await clientCache.get(
          'website-settings',
          () => SettingsService.get(),
          300000 // 5 minutes
        );
        setSettings(data);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const refreshSettings = async () => {
    setLoading(true);
    clientCache.invalidate('website-settings');
    const data = await SettingsService.get();
    setSettings(data);
    setLoading(false);
  };

  return { settings, loading, refreshSettings };
};
