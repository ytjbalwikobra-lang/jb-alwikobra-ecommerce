import React, { useEffect, useState } from 'react';
import {
  generateWhatsAppUrl,
  generateSellAccountMessage
} from '../utils/helpers';
import { SettingsService } from '../services/settingsService';
import { ProductService } from '../services/productService';
import {
  MessageCircle,
  DollarSign,
  Shield,
  Star,
  Clock,
  CheckCircle,
  ArrowRight,
  Smartphone,
  Gamepad2,
  Trophy,
  Users
} from 'lucide-react';

const SellPage: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState('');
  const [accountLevel, setAccountLevel] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [accountDetails, setAccountDetails] = useState('');
  const [gameOptions, setGameOptions] = useState<string[]>([
    'Mobile Legends','PUBG Mobile','Free Fire','Genshin Impact','Call of Duty Mobile','Valorant','Arena of Valor','Clash of Clans','Clash Royale','Honkai Impact','Lainnya'
  ]);
  const [popularGames, setPopularGames] = useState<Array<{
    name: string; 
    count: string; 
    icon: any;
    color?: string;
    logoUrl?: string;
  }>>([
    { name: 'Mobile Legends', count: '500+', icon: Gamepad2, color: '#3b82f6' },
    { name: 'PUBG Mobile', count: '350+', icon: Smartphone, color: '#f59e0b' },
    { name: 'Free Fire', count: '300+', icon: Trophy, color: '#ef4444' },
    { name: 'Genshin Impact', count: '200+', icon: Star, color: '#8b5cf6' },
  ]);
  const [loadingGames, setLoadingGames] = useState(false);

  const [whatsappNumber, setWhatsappNumber] = useState<string>(process.env.REACT_APP_WHATSAPP_NUMBER || '6281234567890');
  useEffect(()=>{ (async ()=>{ try { const s = await SettingsService.get(); if (s?.whatsappNumber) setWhatsappNumber(s.whatsappNumber); } catch {} })(); }, []);

  // Format price with thousand separator
  const formatPrice = (value: string) => {
    // Remove non-numeric characters except Rp
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue) return '';
    
    // Add thousand separators
    const formatted = parseInt(numericValue).toLocaleString('id-ID');
    return `Rp ${formatted}`;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPrice(e.target.value);
    setEstimatedPrice(formatted);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoadingGames(true);
        const gameList = await ProductService.getGameTitles();
        const activeGames = gameList.filter(g=>g.isActive!==false);
        const names = activeGames.map(g=>g.name);
        if (names.length) setGameOptions([...names, 'Lainnya']);
        
        // Get popular games from database based on sold products
        const products = await ProductService.getAllProducts({ includeArchived: true });
        const gameStats = activeGames.map(game => {
          const gameProducts = products.filter(p => 
            (p.gameTitle === game.name || p.gameTitleId === game.id) && 
            (p.isActive === false || p.archivedAt !== null) // Sold products: inactive OR archived
          );
          return {
            name: game.name,
            count: gameProducts.length > 0 ? `${gameProducts.length}+` : '0',
            icon: game.icon || 'Gamepad2',
            color: game.color || '#3b82f6',
            logoUrl: game.logoUrl
          };
        });
        
        console.log('Game stats calculated:', gameStats);
        
        // Always show all games from database, prioritizing those with sales
        const allGames = gameStats.map(game => ({
          ...game,
          // If no sales, show as available for selling
          count: parseInt(game.count) > 0 ? game.count : 'Tersedia'
        }));
        
        setPopularGames(allGames);
        
      } catch (e) {
        console.error('Failed to load games:', e);
        // keep defaults
      } finally { setLoadingGames(false); }
    })();
  }, []);

  const getGameIconComponent = (iconName: string) => {
    const iconMap: {[key: string]: any} = {
      'Gamepad2': Gamepad2,
      'Smartphone': Smartphone,
      'Trophy': Trophy,
      'Star': Star,
      'Users': Users,
      'Shield': Shield
    };
    return iconMap[iconName] || Gamepad2;
  };

  const handleSellAccount = () => {
    // Generate detailed message using form data
    const gameInfo = selectedGame || 'Game yang ingin dijual';
    const levelInfo = accountLevel ? ` (Level/Rank: ${accountLevel})` : '';
    const priceInfo = estimatedPrice ? ` dengan estimasi harga ${estimatedPrice}` : '';
    const detailsInfo = accountDetails ? `\n\nDetail akun:\n${accountDetails}` : '';
    
    const customMessage = `Halo admin JB Alwikobra! 👋\n\nSaya ingin menjual akun ${gameInfo}${levelInfo}${priceInfo}.${detailsInfo}\n\nMohon bantuan untuk evaluasi dan proses penjualan akun saya. Terima kasih!`;
    
    const whatsappUrl = generateWhatsAppUrl(whatsappNumber, customMessage);
    window.open(whatsappUrl, '_blank');
  };

  const benefits = [
    {
      icon: DollarSign,
      title: 'Harga Terbaik',
      description: 'Dapatkan harga terbaik untuk akun game Anda dengan sistem evaluasi yang fair dan transparan.'
    },
    {
      icon: Shield,
      title: 'Proses Aman',
      description: 'Transaksi aman dengan escrow system. Uang Anda aman sampai akun berhasil di-transfer.'
    },
    {
      icon: Clock,
      title: 'Proses Cepat',
      description: 'Evaluasi akun dalam 24 jam, pembayaran langsung setelah akun berhasil dijual.'
    },
    {
      icon: Star,
      title: 'Support Profesional',
      description: 'Tim profesional siap membantu proses jual akun dari awal hingga selesai.'
    }
  ];

  const steps = [
    {
      number: '01',
  title: 'Isi Form Singkat',
  description: 'Masukkan game, level/rank, estimasi harga, dan detail akun agar admin bisa menilai lebih cepat.'
    },
    {
      number: '02',
  title: 'Chat via WhatsApp',
  description: 'Klik tombol WhatsApp untuk mengirim detail akun ke admin. Kami akan merespons cepat di jam operasional.'
    },
    {
      number: '03',
  title: 'Evaluasi & Penawaran',
  description: 'Tim kami mengevaluasi akun Anda dan memberikan penawaran harga terbaik secara transparan.'
    },
    {
      number: '04',
  title: 'Deal & Pencairan',
  description: 'Setelah sepakat, proses transfer akun dilakukan dan dana dicairkan dengan aman.'
    }
  ];

  return (
    <div className="min-h-screen bg-app-dark text-gray-200">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-600 via-pink-500 to-rose-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Jual Akun Game Anda
              <span className="text-black/80"> dengan Harga Terbaik</span>
            </h1>
            <p className="text-xl text-pink-100 mb-8 max-w-3xl mx-auto">
              Platform terpercaya untuk menjual akun game Anda. Proses mudah, aman, dan harga kompetitif.
              Sudah dipercaya oleh ribuan gamer di Indonesia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleSellAccount}
                className="bg-black border border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors flex items-center justify-center space-x-2"
              >
                <MessageCircle size={20} />
                <span>Mulai Jual Akun</span>
              </button>
              <a
                href="#how-it-works"
                className="bg-black text-pink-400 border-2 border-pink-600 px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors"
              >
                Cara Kerjanya
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Form Section */}
      <section className="py-16 bg-black/60 border-t border-pink-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Estimasi Harga Akun Anda
            </h2>
            <p className="text-gray-300">
              Isi form di bawah untuk mendapat estimasi harga akun game Anda
            </p>
          </div>

          <div className="bg-black rounded-2xl p-8 border border-pink-500/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pilih Game
                </label>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="w-full px-4 py-3 border border-pink-500/40 bg-black text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">{loadingGames ? 'Memuat…' : 'Pilih game...'}</option>
                  {gameOptions.map(game => (
                    <option key={game} value={game}>{game}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Level/Rank Akun
                </label>
                <input
                  type="text"
                  value={accountLevel}
                  onChange={(e) => setAccountLevel(e.target.value)}
                  className="w-full px-4 py-3 border border-pink-500/40 bg-black text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Contoh: Mythic Glory, Conqueror, dll"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estimasi Harga (Opsional)
                </label>
                <input
                  type="text"
                  value={estimatedPrice}
                  onChange={handlePriceChange}
                  className="w-full px-4 py-3 border border-pink-500/40 bg-black text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Contoh: Rp 2,000,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Detail Akun
                </label>
                <textarea
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  className="w-full px-4 py-3 border border-pink-500/40 bg-black text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  rows={3}
                  placeholder="Skin, hero, item khusus, dll"
                />
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={handleSellAccount}
                className="bg-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-pink-700 transition-colors flex items-center justify-center space-x-2 mx-auto"
              >
                <MessageCircle size={20} />
                <span>Hubungi Admin untuk Evaluasi</span>
                <ArrowRight size={20} />
              </button>
              <p className="text-sm text-gray-400 mt-4">
                Admin akan menghubungi Anda untuk evaluasi lebih lanjut
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-black/60 border-t border-pink-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Mengapa Jual di JB Alwikobra?
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Platform terpercaya dengan sistem yang aman dan transparan untuk menjual akun game Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="bg-black p-6 rounded-xl border border-pink-500/30 text-center">
                  <div className="w-16 h-16 bg-black border border-pink-500/40 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-pink-400" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-300">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Games */}
      <section className="py-16 bg-black/60 border-t border-pink-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Game Paling Laris Dijual
            </h2>
            <p className="text-gray-300">
              Akun game yang paling banyak dicari pembeli di platform kami
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {popularGames.map((game, index) => {
              const IconComponent = getGameIconComponent(game.icon);
              return (
                <div key={index} className="bg-black p-6 rounded-xl text-center border border-pink-500/30 hover:bg-white/5 transition-colors">
                  <div 
                    className="w-16 h-16 bg-black border border-pink-500/40 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ borderColor: game.color + '40', backgroundColor: game.color + '10' }}
                  >
                    <IconComponent className="text-pink-400" size={28} style={{ color: game.color }} />
                  </div>
                  <h3 className="font-semibold text-white mb-1">{game.name}</h3>
                  <p className="text-sm text-gray-400">
                    {game.count === 'Tersedia' ? 'Siap dibeli' : `${game.count} terjual`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-black/60 border-t border-pink-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Cara Jual Akun di JB Alwikobra
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Proses yang mudah dan aman untuk menjual akun game Anda dalam 4 langkah sederhana
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-black p-6 rounded-xl border border-pink-500/30 text-center">
                  <div className="w-16 h-16 bg-pink-600 text-white rounded-xl flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-300">{step.description}</p>
                </div>
                
                {/* Arrow connector */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="text-pink-500/40" size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center space-x-1 text-white mb-2">
                <Users size={24} />
                <span className="text-3xl font-bold">5000+</span>
              </div>
              <p className="text-pink-100">Akun Terjual</p>
            </div>
            <div>
              <div className="flex items-center justify-center space-x-1 text-white mb-2">
                <Star size={24} />
                <span className="text-3xl font-bold">4.9</span>
              </div>
              <p className="text-pink-100">Rating Kepuasan</p>
            </div>
            <div>
              <div className="flex items-center justify-center space-x-1 text-white mb-2">
                <Clock size={24} />
                <span className="text-3xl font-bold">24</span>
              </div>
              <p className="text-pink-100">Jam Evaluasi</p>
            </div>
            <div>
              <div className="flex items-center justify-center space-x-1 text-white mb-2">
                <CheckCircle size={24} />
                <span className="text-3xl font-bold">100%</span>
              </div>
              <p className="text-pink-100">Transaksi Aman</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-black/60 border-t border-pink-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Siap Menjual Akun Game Anda?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan gamer lainnya yang sudah mempercayakan penjualan akun mereka kepada kami.
            Proses mudah, aman, dan harga terbaik!
          </p>
          <button
            onClick={handleSellAccount}
            className="bg-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-pink-700 transition-colors flex items-center justify-center space-x-2 mx-auto"
          >
            <MessageCircle size={20} />
            <span>Mulai Jual Akun Sekarang</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default SellPage;
