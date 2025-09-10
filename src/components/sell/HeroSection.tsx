import React from 'react';
import { MessageCircle } from 'lucide-react';

interface HeroSectionProps {
  onSellAccount: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onSellAccount }) => {
  return (
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
              onClick={onSellAccount}
              className="bg-black border border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors flex items-center justify-center space-x-2"
            >
              <MessageCircle size={20} />
              <span>Mulai Jual Akun</span>
            </button>
            <a
              href="#form"
              className="bg-white/10 border border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-colors"
            >
              Lihat Form
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
