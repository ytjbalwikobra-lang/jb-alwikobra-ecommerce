import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Mail } from 'lucide-react';

const UnderMaintenancePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-app-dark flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Maintenance Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <Wrench className="text-white" size={48} />
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
          Sedang Dalam
          <span className="text-pink-400"> Perbaikan</span>
        </h1>

        {/* Description */}
        <p className="text-xl text-gray-300 mb-8 max-w-xl mx-auto leading-relaxed">
          Kami sedang melakukan perbaikan dan pemeliharaan sistem untuk memberikan pengalaman yang lebih baik.
          Silakan kembali lagi dalam beberapa saat.
        </p>

        {/* Additional Info */}
        <div className="bg-black/20 border border-pink-500/20 rounded-xl p-6 mb-8">
          <p className="text-gray-400 mb-4">
            Estimasi waktu perbaikan: <span className="text-pink-400 font-semibold">2-4 jam</span>
          </p>
          <p className="text-gray-400">
            Jika Anda memiliki pertanyaan, hubungi tim support kami
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <Link
            to="/help"
            className="bg-transparent text-pink-300 border-2 border-pink-500/60 px-8 py-4 rounded-xl font-semibold hover:bg-pink-500/10 transition-colors flex items-center justify-center space-x-2"
          >
            <Mail size={20} />
            <span>Hubungi Support</span>
          </Link>
        </div>

        {/* Footer Text */}
        <p className="text-gray-500 text-sm mt-8">
          Terima kasih atas kesabaran Anda
        </p>
      </div>
    </div>
  );
};

export default UnderMaintenancePage;
