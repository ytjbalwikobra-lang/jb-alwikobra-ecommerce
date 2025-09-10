import React from 'react';

const StepsSection: React.FC = () => {
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
    <section className="py-16 bg-black/60 border-t border-pink-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          Cara Kerja Sangat Mudah
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full mx-auto flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{step.number}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-pink-600 to-transparent"></div>
                )}
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">{step.title}</h3>
              <p className="text-gray-300 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StepsSection;
