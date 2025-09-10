import React from 'react';

export const PaymentStatusLoader: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-app-dark text-gray-200">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">Memuat status pembayaran...</p>
      </div>
    </div>
  );
};
