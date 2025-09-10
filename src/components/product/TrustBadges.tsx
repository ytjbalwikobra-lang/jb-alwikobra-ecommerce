import React from 'react';
import { Shield, CheckCircle, Clock, MessageCircle } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  return (
    <div className="mt-8 grid grid-cols-2 gap-4">
      <div className="flex items-center space-x-2 text-sm text-gray-300">
        <Shield className="text-green-500" size={16} />
        <span>Garansi 100%</span>
      </div>
      <div className="flex items-center space-x-2 text-sm text-gray-300">
        <CheckCircle className="text-blue-500" size={16} />
        <span>Akun Terverifikasi</span>
      </div>
      <div className="flex items-center space-x-2 text-sm text-gray-300">
        <Clock className="text-orange-500" size={16} />
        <span>Proses 24 Jam</span>
      </div>
      <div className="flex items-center space-x-2 text-sm text-gray-300">
        <MessageCircle className="text-green-500" size={16} />
        <span>Support 24/7</span>
      </div>
    </div>
  );
};
