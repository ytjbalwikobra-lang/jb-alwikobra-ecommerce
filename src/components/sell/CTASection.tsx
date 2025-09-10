import React from 'react';
import { MessageCircle } from 'lucide-react';

interface CTASectionProps {
  onSellAccount: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onSellAccount }) => {
  return (
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
          onClick={onSellAccount}
          className="bg-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-pink-700 transition-colors flex items-center justify-center space-x-2 mx-auto"
        >
          <MessageCircle size={20} />
          <span>Mulai Jual Akun Sekarang</span>
        </button>
      </div>
    </section>
  );
};

export default CTASection;
