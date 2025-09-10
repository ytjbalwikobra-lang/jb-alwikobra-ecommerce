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
    <section className={`py-14 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 id="beranda" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Marketplace Akun Game
            <span className="text-pink-400"> #1 di Indonesia</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Jual, beli, dan rental akun game favorit Anda dengan mudah, aman, dan terpercaya. 
            Dapatkan akun impian dengan harga terbaik!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/flash-sales"
              className="bg-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-pink-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Zap size={20} />
              <span>Flash Sale Hari Ini</span>
            </Link>
            <Link
              to="/products"
              className="bg-transparent text-pink-300 border-2 border-pink-500/60 px-8 py-4 rounded-xl font-semibold hover:bg-pink-500/10 transition-colors flex items-center justify-center space-x-2"
            >
              <ShoppingBag size={20} />
              <span>Lihat Semua Produk</span>
            </Link>
            <Link
              to="/sell"
              className="bg-white text-pink-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
            >
              <ShoppingBag size={20} />
              <span>Jual Akun Game Anda</span>
            </Link>
          </div>
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
    <section className={`py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Kenapa Pilih JB Alwikobra?</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Platform terpercaya dengan layanan terbaik untuk semua kebutuhan gaming Anda
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
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
    <section className={`py-16 bg-gradient-to-r from-pink-600 to-rose-600 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Siap Memulai Petualangan Gaming Anda?
        </h2>
        <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
          Bergabunglah dengan ribuan gamer lainnya yang sudah mempercayakan transaksi mereka kepada kami
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/products"
            className="bg-black/80 text-white border border-white/30 px-8 py-4 rounded-xl font-semibold hover:bg-black/60 transition-colors"
          >
            Mulai Belanja Sekarang
          </Link>
          <Link
            to="/sell"
            className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors"
          >
            Jual Akun Anda
          </Link>
        </div>
      </div>
    </section>
  );
};
