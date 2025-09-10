import { useState, useEffect, useCallback } from 'react';
import { SettingsService } from '../services/settingsService';
import { ProductService } from '../services/productService';
import { generateWhatsAppUrl } from '../utils/helpers';
import { Gamepad2, Smartphone, Trophy, Star } from 'lucide-react';

interface GameOption {
  id?: string;
  name: string;
  isActive?: boolean;
  icon?: string;
  color?: string;
  logoUrl?: string;
}

interface Product {
  gameTitle?: string;
  gameTitleId?: string;
  isActive?: boolean;
  archivedAt?: string | null;
}

interface PopularGame {
  name: string;
  count: string;
  icon: React.ComponentType<any>;
  color?: string;
  logoUrl?: string;
}

interface SellFormData {
  selectedGame: string;
  accountLevel: string;
  estimatedPrice: string;
  accountDetails: string;
}

export const useSellPage = () => {
  // Form state
  const [formData, setFormData] = useState<SellFormData>({
    selectedGame: '',
    accountLevel: '',
    estimatedPrice: '',
    accountDetails: '',
  });

  // Data state
  const [gameOptions, setGameOptions] = useState<string[]>([
    'Mobile Legends','PUBG Mobile','Free Fire','Genshin Impact','Call of Duty Mobile','Valorant','Arena of Valor','Clash of Clans','Clash Royale','Honkai Impact','Lainnya'
  ]);
  
  const [popularGames, setPopularGames] = useState<PopularGame[]>([
    { name: 'Mobile Legends', count: '500+', icon: Gamepad2, color: '#3b82f6' },
    { name: 'PUBG Mobile', count: '350+', icon: Smartphone, color: '#f59e0b' },
    { name: 'Free Fire', count: '300+', icon: Trophy, color: '#ef4444' },
    { name: 'Genshin Impact', count: '200+', icon: Star, color: '#8b5cf6' },
  ]);

  // Loading and settings state
  const [loadingGames, setLoadingGames] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState<string>(
    process.env.REACT_APP_WHATSAPP_NUMBER || '6281234567890'
  );

  // Format price with thousand separator
  const formatPrice = useCallback((value: string): string => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue) return '';
    
    const formatted = parseInt(numericValue).toLocaleString('id-ID');
    return `Rp ${formatted}`;
  }, []);

  // Handle form field changes
  const handleFormChange = useCallback((field: keyof SellFormData, value: string) => {
    if (field === 'estimatedPrice') {
      setFormData(prev => ({
        ...prev,
        [field]: formatPrice(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  }, [formatPrice]);

  // Handle price input change
  const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPrice(e.target.value);
    setFormData(prev => ({
      ...prev,
      estimatedPrice: formatted
    }));
  }, [formatPrice]);

  // Get icon component for games
  const getGameIcon = useCallback((iconName: string): React.ComponentType<any> => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      Gamepad2,
      Smartphone,
      Trophy,
      Star
    };
    return iconMap[iconName] || Gamepad2;
  }, []);

  // Load settings
  const loadSettings = useCallback(async () => {
    try {
      const settings = await SettingsService.get();
      if (settings?.whatsappNumber) {
        setWhatsappNumber(settings.whatsappNumber);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  // Load games data
  const loadGamesData = useCallback(async () => {
    setLoadingGames(true);
    try {
      const gameList = await ProductService.getGameTitles();
      const activeGames = gameList.filter((g: GameOption) => g.isActive !== false);
      const names = activeGames.map((g: GameOption) => g.name);
      
      if (names.length) {
        setGameOptions([...names, 'Lainnya']);
      }
      
      // Get popular games from database based on sold products
      const products = await ProductService.getAllProducts({ includeArchived: true });
      const gameStats = activeGames.map((game: GameOption) => {
        const gameProducts = products.filter((p: Product) => 
          (p.gameTitle === game.name || p.gameTitleId === game.id) && 
          (p.isActive === false || p.archivedAt !== null) // Sold products
        );
        return {
          name: game.name,
          count: gameProducts.length > 0 ? `${gameProducts.length}+` : 'Tersedia',
          icon: game.icon || 'Gamepad2',
          color: game.color || '#3b82f6',
          logoUrl: game.logoUrl
        };
      });
      
      setPopularGames(gameStats.map(game => ({
        ...game,
        icon: getGameIcon(game.icon)
      })));
      
    } catch (error) {
      console.error('Failed to load games:', error);
      // Keep default values on error
    } finally {
      setLoadingGames(false);
    }
  }, [getGameIcon]);

  // Handle sell account
  const handleSellAccount = useCallback(() => {
    const gameInfo = formData.selectedGame || 'Game yang ingin dijual';
    const levelInfo = formData.accountLevel ? ` (Level/Rank: ${formData.accountLevel})` : '';
    const priceInfo = formData.estimatedPrice ? ` dengan estimasi harga ${formData.estimatedPrice}` : '';
    const detailsInfo = formData.accountDetails ? `\n\nDetail akun:\n${formData.accountDetails}` : '';
    
    const customMessage = `Halo admin JB Alwikobra! 👋\n\nSaya ingin menjual akun ${gameInfo}${levelInfo}${priceInfo}.${detailsInfo}\n\nMohon bantuan untuk evaluasi dan proses penjualan akun saya. Terima kasih!`;
    
    const whatsappUrl = generateWhatsAppUrl(whatsappNumber, customMessage);
    window.open(whatsappUrl, '_blank');
  }, [formData, whatsappNumber]);

  // Load data on mount
  useEffect(() => {
    void loadSettings();
    void loadGamesData();
  }, [loadSettings, loadGamesData]);

  return {
    // Form data
    formData,
    gameOptions,
    popularGames,
    loadingGames,
    
    // Handlers
    handleFormChange,
    handlePriceChange,
    handleSellAccount,
    
    // Utilities
    formatPrice,
    getGameIcon,
  };
};

export default useSellPage;
