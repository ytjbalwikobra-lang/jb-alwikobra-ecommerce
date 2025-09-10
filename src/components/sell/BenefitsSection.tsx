import React from 'react';
import { DollarSign, Shield, Star } from 'lucide-react';

const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: DollarSign,
      title: 'Harga Terbaik',
      description: 'Dapatkan harga terbaik untuk akun game Anda dengan sistem evaluasi yang fair dan transparan.'
    },
    {
      icon: Shield,
      title: 'Proses Aman',
      description: 'Keamanan transaksi terjamin dengan sistem escrow dan verifikasi berlapis untuk melindungi penjual.'
    },
    {
      icon: Star,
      title: 'Support Profesional',
      description: 'Tim profesional siap membantu proses jual akun dari awal hingga selesai.'
    }
  ];

  return (
    <section className="py-16 bg-black/60 border-t border-pink-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          Mengapa Memilih Kami?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div 
                key={index}
                className="bg-pink-900/20 border border-pink-500/30 rounded-xl p-8 text-center hover:bg-pink-900/30 transition-colors"
              >
                <div className="w-16 h-16 bg-pink-600/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <IconComponent size={32} className="text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
