import React from 'react';

interface AuthHeaderProps {
  mode: 'login' | 'signup' | 'verify' | 'complete';
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ mode }) => {
  const getTitle = () => {
    switch (mode) {
      case 'login':
        return 'Masuk ke Akun';
      case 'signup':
        return 'Daftar Akun Baru';
      case 'verify':
        return 'Verifikasi WhatsApp';
      case 'complete':
        return 'Lengkapi Profil';
      default:
        return 'Authentikasi';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login':
        return 'Silakan masuk untuk melanjutkan';
      case 'signup':
        return 'Buat akun baru untuk mulai berbelanja';
      case 'verify':
        return 'Masukkan kode verifikasi yang dikirim ke WhatsApp Anda';
      case 'complete':
        return 'Lengkapi informasi profil Anda';
      default:
        return '';
    }
  };

  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-white mb-2">
        {getTitle()}
      </h1>
      <p className="text-gray-400 text-sm">
        {getSubtitle()}
      </p>
    </div>
  );
};
