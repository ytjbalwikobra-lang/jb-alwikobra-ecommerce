import React from 'react';
import { Link } from 'react-router-dom';

interface PaymentNoOrderProps {
  isAuthenticated: boolean;
}

export const PaymentNoOrder: React.FC<PaymentNoOrderProps> = ({ isAuthenticated }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-app-dark text-gray-200">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Tidak ada detail order</h2>
        <p className="text-gray-300 mb-4">
          Jika pembayaran berhasil, Anda akan menerima email konfirmasi.{' '}
          {isAuthenticated 
            ? 'Cek juga riwayat order Anda.' 
            : 'Silakan login untuk melihat riwayat order.'
          }
        </p>
        <div className="flex gap-3 justify-center">
          {isAuthenticated && (
            <Link 
              to="/orders" 
              className="bg-pink-600 text-white px-4 py-2 rounded-lg"
            >
              Lihat Riwayat Order
            </Link>
          )}
          <Link 
            to="/" 
            className="border border-pink-500/40 px-4 py-2 rounded-lg"
          >
            Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};
