import React from 'react';
import { Clock, Zap } from 'lucide-react';

export const FlashSaleHowItWorks: React.FC = () => {
  return (
    <section className="py-16 bg-black/60 border-t border-pink-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 id="cara-kerja" className="text-3xl font-bold text-white mb-4">
            Cara Kerja Flash Sale
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Dapatkan akun game impian dengan harga terbaik melalui sistem flash sale kami
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-black border border-pink-500/40 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Clock className="text-pink-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Waktu Terbatas
            </h3>
            <p className="text-gray-300">
              Flash sale berlangsung dalam waktu terbatas. Pantau countdown timer untuk tidak melewatkan kesempatan.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-black border border-pink-500/40 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-pink-400 font-bold text-xl">STOK</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Stok Terbatas
            </h3>
            <p className="text-gray-300">
              Jumlah akun yang dijual dengan harga flash sale sangat terbatas. First come, first served!
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-black border border-pink-500/40 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="text-pink-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Pembayaran Instan
            </h3>
            <p className="text-gray-300">
              Gunakan Xendit payment gateway untuk pembayaran yang cepat dan aman. Akun langsung dikirim setelah pembayaran.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
