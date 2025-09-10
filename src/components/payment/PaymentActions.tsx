import React from 'react';
import { Link } from 'react-router-dom';

export const PaymentActions: React.FC = () => {
  return (
    <div className="flex gap-3">
      <Link 
        to="/products" 
        className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        Lanjut belanja
      </Link>
      <Link 
        to="/" 
        className="border border-pink-500/40 hover:border-pink-500/60 px-4 py-2 rounded-lg transition-colors"
      >
        Beranda
      </Link>
    </div>
  );
};
