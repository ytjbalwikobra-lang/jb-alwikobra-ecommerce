import React from 'react';
import PhoneInput from '../PhoneInput';
import PasswordInput from '../PasswordInput';

interface SignupFormProps {
  data: {
    phone: string;
    password: string;
    confirmPassword: string;
  };
  loading: boolean;
  onChange: (data: { phone: string; password: string; confirmPassword: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onModeChange: (mode: 'login') => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  data,
  loading,
  onChange,
  onSubmit,
  onModeChange
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Nomor WhatsApp
        </label>
        <PhoneInput
          value={data.phone}
          onChange={(value) => onChange({ ...data, phone: value })}
          placeholder="08123456789"
          className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none"
        />
        <p className="text-xs text-gray-400 mt-1">
          Kode verifikasi akan dikirim ke nomor ini
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Password
        </label>
        <PasswordInput
          value={data.password}
          onChange={(value) => onChange({ ...data, password: value })}
          placeholder="Minimal 6 karakter"
          className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Konfirmasi Password
        </label>
        <PasswordInput
          value={data.confirmPassword}
          onChange={(value) => onChange({ ...data, confirmPassword: value })}
          placeholder="Ulangi password"
          className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Mendaftar...' : 'Daftar'}
      </button>

      <div className="text-center">
        <p className="text-gray-400 text-sm">
          Sudah punya akun?{' '}
          <button
            type="button"
            onClick={() => onModeChange('login')}
            className="text-pink-400 hover:text-pink-300 font-medium"
          >
            Masuk di sini
          </button>
        </p>
      </div>
    </form>
  );
};
