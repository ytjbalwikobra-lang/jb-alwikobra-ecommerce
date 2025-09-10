import React from 'react';
import { Users, Star, Clock, CheckCircle } from 'lucide-react';

const StatsSection: React.FC = () => {
  const stats = [
    {
      icon: Users,
      value: '5000+',
      label: 'Akun Terjual'
    },
    {
      icon: Star,
      value: '4.9',
      label: 'Rating Kepuasan'
    },
    {
      icon: Clock,
      value: '24',
      label: 'Jam Evaluasi'
    },
    {
      icon: CheckCircle,
      value: '100%',
      label: 'Transaksi Aman'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-pink-600 to-rose-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          Dipercaya Ribuan Gamer
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center space-x-1 text-white mb-2">
                  <IconComponent size={24} />
                  <span className="text-3xl font-bold">{stat.value}</span>
                </div>
                <p className="text-pink-100">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
