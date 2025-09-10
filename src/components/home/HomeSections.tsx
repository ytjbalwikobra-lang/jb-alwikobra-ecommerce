import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  ShoppingBag,
  Clock,
  Star,
  Shield,
  Headphones
} from 'lucide-react';

interface HeroSectionProps {
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ className = '' }) => {
  return (
    <section className={`py-16 md:py-20 text-center ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 id="beranda" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
          Marketplace Akun Game
          <br className="hidden md:block" />
          <span className="text-pink-400">#1 di Indonesia</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
          Jual, beli, dan rental akun game favorit Anda dengan mudah, aman, dan terpercaya. 
          Dapatkan akun impian dengan harga terbaik!
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/flash-sales"
            className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-pink-500/40 transform hover:scale-105"
          >
            <Zap size={20} />
            <span>Flash Sale</span>
          </Link>
          <Link
            to="/products"
            className="bg-gray-800 text-pink-300 border border-pink-500/50 px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 hover:border-pink-500 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <ShoppingBag size={20} />
            <span>Lihat Produk</span>
          </Link>
          <Link
            to="/sell"
            className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center justify-center space-x-2 shadow-md"
          >
            <span>Jual Akun Anda</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

interface FeaturesSectionProps {
  className?: string;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ className = '' }) => {
  const features = [
    {
      icon: Shield,
      title: 'Aman & Terpercaya',
      description: 'Transaksi aman dengan jaminan uang kembali'
    },
    {
      icon: Clock,
      title: 'Proses Cepat',
      description: 'Akun dikirim maksimal 24 jam setelah pembayaran'
    },
    {
      icon: Star,
      title: 'Kualitas Terbaik',
      description: 'Semua akun sudah diverifikasi dan berkualitas tinggi'
    },
    {
      icon: Headphones,
      title: 'Support 24/7',
      description: 'Tim customer service siap membantu kapan saja'
    }
  ];

  return (
    <section className={`py-16 md:py-20 bg-gray-900 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Kenapa Pilih JB Alwikobra?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Platform terpercaya dengan layanan terbaik untuk semua kebutuhan gaming Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center p-6 bg-gray-800/50 rounded-xl border border-white/10 transform transition-transform duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                  <Icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

interface CTASectionProps {
  className?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({ className = '' }) => {
  return (
    <section className={`py-16 md:py-20 bg-gradient-to-r from-pink-600 to-purple-700 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Siap Memulai Petualangan Gaming Anda?
        </h2>
        <p className="text-pink-200 mb-8 max-w-2xl mx-auto text-lg">
          Bergabunglah dengan ribuan gamer lainnya yang sudah mempercayakan transaksi mereka kepada kami.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/products"
            className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300 shadow-lg transform hover:scale-105"
          >
            Mulai Belanja Sekarang
          </Link>
          <Link
            to="/sell"
            className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300"
          >
            Jual Akun Anda
          </Link>
        </div>
      </div>
    </section>
  );
};
