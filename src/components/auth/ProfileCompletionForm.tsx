import React from 'react';
import PasswordInput from '../PasswordInput';

interface ProfileCompletionFormProps {
  data: {
    email: string;
    name: string;
    password: string;
    confirmPassword: string;
  };
  loading: boolean;
  onChange: (data: { email: string; name: string; password: string; confirmPassword: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ProfileCompletionForm: React.FC<ProfileCompletionFormProps> = ({
  data,
  loading,
  onChange,
  onSubmit
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email
        </label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => onChange({ ...data, email: e.target.value })}
          placeholder="email@example.com"
          className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Nama Lengkap
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="Nama lengkap Anda"
          className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Password Baru (Opsional)
        </label>
        <PasswordInput
          value={data.password}
          onChange={(value) => onChange({ ...data, password: value })}
          placeholder="Kosongkan jika tidak ingin mengganti"
          className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none"
        />
      </div>

      {data.password && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Konfirmasi Password
          </label>
          <PasswordInput
            value={data.confirmPassword}
            onChange={(value) => onChange({ ...data, confirmPassword: value })}
            placeholder="Ulangi password baru"
            className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Menyimpan...' : 'Lengkapi Profil'}
      </button>
    </form>
  );
};
