import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export const FlashSaleCTA: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-pink-600 to-rose-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Jual Akun Anda Sekarang!
        </h2>
        <p className="text-pink-100 mb-8 max-w-2xl mx-auto">
          Punya akun game yang tidak terpakai? Jual di platform kami dan dapatkan harga terbaik dengan proses yang mudah dan aman.
        </p>
        <div className="flex justify-center">
          <Link 
            to="/sell"
            className="bg-black border border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors inline-flex items-center space-x-2"
          >
            <span>Mulai Jual Akun</span>
            <ArrowUpRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
};
