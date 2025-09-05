import { SettingsService } from './settingsService.ts';

export class FaviconService {
  private static defaultFavicon = '/favicon.ico';

  static async updateFavicon(): Promise<void> {
    try {
      const settings = await SettingsService.get();
      const faviconUrl = settings?.faviconUrl || this.defaultFavicon;
      
      // Remove existing favicon links
      const existingLinks = document.querySelectorAll('link[rel*="icon"]');
      existingLinks.forEach(link => link.remove());
      
      // Add new favicon link
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/x-icon';
      link.href = faviconUrl;
      document.head.appendChild(link);
      
      // Also update apple-touch-icon if available
      if (settings?.faviconUrl) {
        const appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        appleLink.href = faviconUrl;
        document.head.appendChild(appleLink);
      }
      
    } catch (error) {
      console.error('Failed to update favicon:', error);
      // Fallback to default favicon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/x-icon';
      link.href = this.defaultFavicon;
      document.head.appendChild(link);
    }
  }

  static async updatePageTitle(): Promise<void> {
    try {
      const settings = await SettingsService.get();
      const siteName = settings?.siteName || 'JB Alwikobra';
      document.title = `${siteName} - Jual Beli Rental Akun Game`;
    } catch (error) {
      console.error('Failed to update page title:', error);
    }
  }
}
