import React, { useEffect, useRef, useState } from 'react';
import {
  generateWhatsAppUrl,
  generateSellAccountMessage
} from '../utils/helpers';
import { SettingsService } from '../services/settingsService';
import { ProductService } from '../services/productService';
import { IOSHero, IOSContainer, IOSCard, IOSButton } from '../components/ios/IOSDesignSystem';
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
  const [loadingGames, setLoadingGames] = useState(true);

  const [whatsappNumber, setWhatsappNumber] = useState<string>(process.env.REACT_APP_WHATSAPP_NUMBER || '6281234567890');
  const formRef = useRef<HTMLDivElement | null>(null);
  useEffect(()=>{ (async ()=>{ try { const s = await SettingsService.get(); if (s?.whatsappNumber) setWhatsappNumber(s.whatsappNumber); } catch (_e) { /* ignore settings fetch for smoother UX */ } })(); }, []);

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
        
        // Use optimized popular games service with built-in product counts
        const popularGamesData = await ProductService.getPopularGames();
        
        // Map to our UI format and include all active games
        const gameStats = activeGames.map(game => {
          const popularGame = popularGamesData.find(pg => pg.name === game.name);
          const productCount = popularGame?.count || 0;
          
          return {
            name: game.name,
            count: productCount > 0 ? `${productCount}+` : 'Tersedia',
            icon: game.icon || 'Gamepad2',
            color: game.color || '#3b82f6',
            logoUrl: game.logoUrl
          };
        });
        
        console.log('Game stats calculated:', gameStats);
        setPopularGames(gameStats);
        
      } catch (e) {
        console.error('Failed to load games:', e);
        // keep defaults
      } finally { setLoadingGames(false); }
    })();
  }, []);

  const getGameIconComponent = (iconName: any) => {
    // Support both string icon names and direct Lucide components
    if (typeof iconName === 'function') return iconName;
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

  const normalizePhoneNumber = (phone: string) => {
    // Keep digits only, convert leading 0 to 62 (ID)
    let digits = (phone || '').replace(/[^0-9]/g, '');
    if (digits.startsWith('0')) digits = '62' + digits.slice(1);
    return digits;
  };

  const handleSellAccount = () => {
    // Generate detailed message using form data
    const gameInfo = selectedGame || 'Game yang ingin dijual';
    const levelInfo = accountLevel ? ` (Level/Rank: ${accountLevel})` : '';
    const priceInfo = estimatedPrice ? ` dengan estimasi harga ${estimatedPrice}` : '';
    const detailsInfo = accountDetails ? `\n\nDetail akun:\n${accountDetails}` : '';
    
    const customMessage = `Halo admin JB Alwikobra! 👋\n\nSaya ingin menjual akun ${gameInfo}${levelInfo}${priceInfo}.${detailsInfo}\n\nMohon bantuan untuk evaluasi dan proses penjualan akun saya. Terima kasih!`;
    
  const whatsappUrl = generateWhatsAppUrl(normalizePhoneNumber(whatsappNumber), customMessage);
    window.open(whatsappUrl, '_blank');
  };

  const scrollToForm = () => {
    const el = formRef.current || document.getElementById('sell-form');
    if (el) {
      // Offset for fixed header (approx 56px mobile / 64px desktop)
      const headerOffset = window.innerWidth < 768 ? 56 : 64;
      const rect = el.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const top = rect.top + scrollTop - headerOffset - 8;
      window.scrollTo({ top, behavior: 'smooth' });
      return;
    }
    // Fallback anchor navigation
    window.location.hash = '#sell-form';
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
      title: 'Hubungi Admin',
      description: 'Klik tombol WhatsApp untuk menghubungi admin dengan detail akun Anda.'
    },
    {
      number: '02',
      title: 'Evaluasi Akun',
      description: 'Tim kami akan mengevaluasi akun dan memberikan estimasi harga terbaik.'
    },
    {
      number: '03',
      title: 'Konfirmasi Deal',
      description: 'Setujui harga dan syarat, kemudian akun akan diproses untuk dijual.'
    },
    {
      number: '04',
      title: 'Terima Pembayaran',
      description: 'Dapatkan pembayaran langsung setelah akun berhasil terjual ke pembeli.'
    }
  ];

  return (
    <div className="min-h-screen bg-ios-background text-ios-text">
      {/* Hero Section */}
      <IOSHero
        title="Jual Akun Game Anda"
        subtitle="Platform terpercaya untuk menjual akun game Anda. Proses mudah, aman, dan harga kompetitif. Sudah dipercaya oleh ribuan gamer di Indonesia."
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <IOSButton variant="secondary" size="large" onClick={scrollToForm}>
            <MessageCircle size={20} />
            <span className="ml-2">Mulai Jual Akun</span>
          </IOSButton>
          <a
            href="#how-it-works"
            className="bg-white/20 backdrop-blur-sm text-white border-2 border-white px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-colors text-center shadow-lg"
          >
            Cara Kerjanya
          </a>
        </div>
      </IOSHero>

      {/* Quick Form Section */}
    <section id="sell-form" className="py-16 bg-ios-background border-t border-ios-border">
  <div ref={formRef} className="scroll-mt-20">
  <IOSContainer maxWidth="lg" className="with-bottom-nav">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ios-text mb-4">
              Estimasi Harga Akun Anda
            </h2>
            <p className="text-ios-text-secondary">
              Isi form di bawah untuk mendapat estimasi harga akun game Anda
            </p>
          </div>

          <IOSCard padding="large">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-ios-text-secondary mb-2">
                  Pilih Game
                </label>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="w-full px-4 py-3 border border-ios-border bg-ios-surface text-ios-text rounded-lg focus:ring-2 focus:ring-ios-accent focus:border-ios-accent"
                >
                  <option value="">{loadingGames ? 'Memuat…' : 'Pilih game...'}</option>
                  {gameOptions.map(game => (
                    <option key={game} value={game}>{game}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ios-text-secondary mb-2">
                  Level/Rank Akun
                </label>
                <input
                  type="text"
                  value={accountLevel}
                  onChange={(e) => setAccountLevel(e.target.value)}
                  className="w-full px-4 py-3 border border-ios-border bg-ios-surface text-ios-text rounded-lg focus:ring-2 focus:ring-ios-accent focus:border-ios-accent"
                  placeholder="Contoh: Mythic Glory, Conqueror, dll"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ios-text-secondary mb-2">
                  Estimasi Harga (Opsional)
                </label>
                <input
                  type="text"
                  value={estimatedPrice}
                  onChange={handlePriceChange}
                  className="w-full px-4 py-3 border border-ios-border bg-ios-surface text-ios-text rounded-lg focus:ring-2 focus:ring-ios-accent focus:border-ios-accent"
                  placeholder="Contoh: Rp 2,000,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ios-text-secondary mb-2">
                  Detail Akun
                </label>
                <textarea
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  className="w-full px-4 py-3 border border-ios-border bg-ios-surface text-ios-text rounded-lg focus:ring-2 focus:ring-ios-accent focus:border-ios-accent"
                  rows={3}
                  placeholder="Skin, hero, item khusus, dll"
                />
              </div>
            </div>

            <div className="mt-8 text-center">
              <IOSButton size="large" onClick={handleSellAccount} className="w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <MessageCircle size={20} />
                  <span>Hubungi Admin untuk Evaluasi</span>
                  <ArrowRight size={20} />
                </div>
              </IOSButton>
              <p className="text-sm text-ios-text-secondary mt-4">
                Admin akan menghubungi Anda untuk evaluasi lebih lanjut
              </p>
            </div>
          </IOSCard>
    </IOSContainer>
  </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-ios-background border-t border-ios-border">
  <IOSContainer className="with-bottom-nav">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ios-text mb-4">
              Mengapa Jual di JB Alwikobra?
            </h2>
            <p className="text-ios-text-secondary max-w-2xl mx-auto">
              Platform terpercaya dengan sistem yang aman dan transparan untuk menjual akun game Anda
            </p>
          </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
        <IOSCard key={index} padding="large" className="text-center">
                  <div className="w-16 h-16 bg-ios-surface border border-ios-border rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-pink-400" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-ios-text mb-2">{benefit.title}</h3>
                  <p className="text-ios-text-secondary">{benefit.description}</p>
        </IOSCard>
              );
            })}
          </div>
    </IOSContainer>
      </section>

      {/* Popular Games */}
      <section className="py-16 bg-ios-background border-t border-ios-border">
  <IOSContainer className="with-bottom-nav">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ios-text mb-4">
              Game Paling Laris Dijual
            </h2>
            <p className="text-ios-text-secondary">
              Akun game yang paling banyak dicari pembeli di platform kami
            </p>
          </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {loadingGames ? (
              Array.from({ length: 8 }).map((_, i) => (
                <IOSCard key={i} padding="large" className="text-center">
                  <div className="w-12 h-12 rounded-lg mx-auto mb-3 ios-skeleton"></div>
                  <div className="h-4 w-24 mx-auto ios-skeleton mb-2"></div>
                  <div className="h-3 w-20 mx-auto ios-skeleton"></div>
                </IOSCard>
              ))
            ) : (
              popularGames.map((game, index) => {
                const IconComponent = getGameIconComponent(game.icon);
                return (
          <IOSCard key={index} padding="large" className="text-center">
                    <div 
                      className="w-12 h-12 bg-ios-surface border border-ios-border rounded-lg flex items-center justify-center mx-auto mb-3"
                      style={{ borderColor: game.color + '40', backgroundColor: game.color + '10' }}
                    >
                      <IconComponent className="text-pink-400" size={20} style={{ color: game.color }} />
                    </div>
                    <h3 className="font-semibold text-ios-text mb-1">{game.name}</h3>
                    <p className="text-sm text-ios-text-secondary">
                      {game.count === 'Tersedia' ? 'Siap dibeli' : `${game.count} terjual`}
                    </p>
          </IOSCard>
                );
              })
            )}
          </div>
    </IOSContainer>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-ios-background border-t border-ios-border">
  <IOSContainer className="with-bottom-nav">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ios-text mb-4">
              Cara Jual Akun di JB Alwikobra
            </h2>
            <p className="text-ios-text-secondary max-w-2xl mx-auto">
              Proses yang mudah dan aman untuk menjual akun game Anda dalam 4 langkah sederhana
            </p>
          </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
  <IOSCard padding="large" className="text-center">
                  <div className="w-16 h-16 bg-pink-600 text-white rounded-xl flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {step.number}
                  </div>
      <h3 className="text-lg font-semibold text-ios-text mb-2">{step.title}</h3>
      <p className="text-ios-text-secondary">{step.description}</p>
        </IOSCard>
                
                {/* Arrow connector */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="text-pink-500/40" size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
    </IOSContainer>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-pink-600">
        <IOSContainer>
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
        </IOSContainer>
      </section>

      {/* CTA Section */}
    <section className="py-16 bg-ios-background border-t border-ios-border">
  <IOSContainer maxWidth="lg" className="with-bottom-nav">
          <div className="text-center">
      <h2 className="text-3xl font-bold text-ios-text mb-4">
            Siap Menjual Akun Game Anda?
          </h2>
      <p className="text-ios-text-secondary mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan gamer lainnya yang sudah mempercayakan penjualan akun mereka kepada kami.
            Proses mudah, aman, dan harga terbaik!
          </p>
          <IOSButton size="large" onClick={handleSellAccount}>
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              <span>Mulai Jual Akun Sekarang</span>
            </div>
          </IOSButton>
          </div>
        </IOSContainer>
      </section>
    </div>
  );
};

export default SellPage;
