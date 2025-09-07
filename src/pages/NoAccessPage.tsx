import React from 'react';
import { Link } from 'react-router-dom';

const NoAccessPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center p-6 rounded-lg bg-black/40 border border-red-500/30 max-w-md">
        <h1 className="text-2xl font-bold text-white mb-2">Tidak Memiliki Akses</h1>
        <p className="text-gray-300 mb-4">Akun Anda tidak memiliki izin untuk membuka halaman ini.</p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/" className="px-4 py-2 rounded bg-pink-600 text-white hover:bg-pink-700">Kembali ke Beranda</Link>
          <Link to="/auth" className="px-4 py-2 rounded bg-gray-700 text-gray-100 hover:bg-gray-600">Ganti Akun</Link>
        </div>
      </div>
    </div>
  );
};

export default NoAccessPage;
