import { useState, useEffect } from 'react';
import { SettingsService } from '../../services/settingsService';

interface FooterSettings {
  siteName: string;
  logoUrl: string;
  whatsappNumber: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
}

export const useFooterSettings = () => {
  const [settings, setSettings] = useState<FooterSettings>({
    siteName: 'JB Alwikobra',
    logoUrl: '',
    whatsappNumber: process.env.REACT_APP_WHATSAPP_NUMBER || '6281234567890',
    contactEmail: 'admin@jbalwikobra.com',
    contactPhone: '',
    address: 'Jakarta, Indonesia',
    facebookUrl: 'https://facebook.com/',
    instagramUrl: 'https://instagram.com/',
    tiktokUrl: 'https://tiktok.com/',
    youtubeUrl: 'https://youtube.com/'
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const s = await SettingsService.get();
        if (s) {
          setSettings(prev => ({
            ...prev,
            ...(s.siteName && { siteName: s.siteName }),
            ...(s.logoUrl && { logoUrl: s.logoUrl }),
            ...(s.whatsappNumber && { whatsappNumber: s.whatsappNumber }),
            ...(s.contactEmail && { contactEmail: s.contactEmail }),
            ...(s.contactPhone && { contactPhone: s.contactPhone }),
            ...(s.address && { address: s.address }),
            ...(s.facebookUrl && { facebookUrl: s.facebookUrl }),
            ...(s.instagramUrl && { instagramUrl: s.instagramUrl }),
            ...(s.tiktokUrl && { tiktokUrl: s.tiktokUrl }),
            ...(s.youtubeUrl && { youtubeUrl: s.youtubeUrl })
          }));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadSettings();
  }, []);

  return { settings, isLoading };
};
