import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Mail, Star, Sparkles } from 'lucide-react';

const UnderMaintenancePage: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // Simulate maintenance progress
    const interval = setInterval(() => {
      setProgress(prev => (prev + 1) % 101);
    }, 200);

    // Generate floating stars
    const generateStars = () => {
      const newStars = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 3
      }));
      setStars(newStars);
    };

    generateStars();

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-app-dark flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Floating Stars Background */}
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute animate-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            animationDelay: `${star.delay}s`,
            animationDuration: '3s'
          }}
        >
          <Star className="text-pink-400/20" size={16} />
        </div>
      ))}

      {/* Sparkle Effects */}
      <div className="absolute top-20 left-20 animate-bounce">
        <Sparkles className="text-pink-300/30" size={24} />
      </div>
      <div className="absolute top-40 right-32 animate-bounce" style={{ animationDelay: '1s' }}>
        <Sparkles className="text-pink-300/30" size={20} />
      </div>
      <div className="absolute bottom-32 left-16 animate-bounce" style={{ animationDelay: '2s' }}>
        <Sparkles className="text-pink-300/30" size={18} />
      </div>

      <div className="max-w-2xl mx-auto text-center relative z-10">
        {/* Maintenance Icon with Animation */}
        <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-spin hover:animate-pulse transition-all duration-300">
          <Wrench className="text-white animate-pulse" size={48} />
        </div>

        {/* Main Heading with Typing Effect */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
          Sedang Dalam
          <span className="text-pink-400 animate-pulse"> Perbaikan</span>
        </h1>

        {/* Description */}
        <p className="text-xl text-gray-300 mb-8 max-w-xl mx-auto leading-relaxed">
          Kami sedang melakukan perbaikan dan pemeliharaan sistem untuk memberikan pengalaman yang lebih baik.
          Silakan kembali lagi dalam beberapa saat.
        </p>

        {/* Progress Bar */}
        <div className="bg-black/20 border border-pink-500/20 rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400">Progress Perbaikan</p>
            <p className="text-pink-400 font-semibold">{progress}%</p>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-pink-500 to-pink-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-gray-400 mt-4">
            Estimasi waktu perbaikan: <span className="text-pink-400 font-semibold">2-4 jam</span>
          </p>
          <p className="text-gray-400">
            Jika Anda memiliki pertanyaan, hubungi tim support kami
          </p>
        </div>

        {/* Action Button with Hover Effects */}
        <div className="flex justify-center">
          <Link
            to="/help"
            className="bg-transparent text-pink-300 border-2 border-pink-500/60 px-8 py-4 rounded-xl font-semibold hover:bg-pink-500/10 transition-colors flex items-center justify-center space-x-2 transform hover:scale-105"
          >
            <Mail size={20} className="animate-pulse" />
            <span>Hubungi Support</span>
          </Link>
        </div>

        {/* Footer Text */}
        <p className="text-gray-500 text-sm mt-8">
          Terima kasih atas kesabaran Anda ✨
        </p>
      </div>
    </div>
  );
};

export default UnderMaintenancePage;
