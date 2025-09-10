import React from 'react';

export const OrderHistoryLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center text-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p>Memuat riwayat pesanan...</p>
      </div>
    </div>
  );
};
