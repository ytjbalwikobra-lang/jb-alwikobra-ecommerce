import React from 'react';
import PasswordInput from '../PasswordInput';
import PhoneInput from '../PhoneInput';

interface LoginFormProps {
  activeTab: 'email' | 'phone';
  emailData: {
    email: string;
    password: string;
  };
  phoneData: {
    phone: string;
    password: string;
  };
  loading: boolean;
  onEmailChange: (data: { email: string; password: string }) => void;
  onPhoneChange: (data: { phone: string; password: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onModeChange: (mode: 'signup') => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  activeTab,
  emailData,
  phoneData,
  loading,
  onEmailChange,
  onPhoneChange,
  onSubmit,
  onModeChange
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {activeTab === 'email' ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={emailData.email}
              onChange={(e) => onEmailChange({ ...emailData, email: e.target.value })}
              className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none"
              placeholder="email@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <PasswordInput
              value={emailData.password}
              onChange={(value) => onEmailChange({ ...emailData, password: value })}
              placeholder="Masukkan password"
              className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none"
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nomor WhatsApp
            </label>
            <PhoneInput
              value={phoneData.phone}
              onChange={(value) => onPhoneChange({ ...phoneData, phone: value })}
              placeholder="08123456789"
              className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <PasswordInput
              value={phoneData.password}
              onChange={(value) => onPhoneChange({ ...phoneData, password: value })}
              placeholder="Masukkan password"
              className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none"
            />
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Memproses...' : 'Masuk'}
      </button>

      <div className="text-center">
        <p className="text-gray-400 text-sm">
          Belum punya akun?{' '}
          <button
            type="button"
            onClick={() => onModeChange('signup')}
            className="text-pink-400 hover:text-pink-300 font-medium"
          >
            Daftar di sini
          </button>
        </p>
      </div>
    </form>
  );
};
