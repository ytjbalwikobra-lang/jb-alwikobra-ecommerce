import React from 'react';

interface VerificationFormProps {
  data: {
    userId: string;
    code: string;
  };
  loading: boolean;
  onChange: (data: { userId: string; code: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export const VerificationForm: React.FC<VerificationFormProps> = ({
  data,
  loading,
  onChange,
  onSubmit,
  onBack
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Kode Verifikasi
        </label>
        <input
          type="text"
          value={data.code}
          onChange={(e) => onChange({ ...data, code: e.target.value })}
          placeholder="000000"
          maxLength={6}
          className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none text-center text-2xl tracking-widest"
          required
        />
        <p className="text-xs text-gray-400 mt-1 text-center">
          Masukkan 6 digit kode yang dikirim ke WhatsApp Anda
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Memverifikasi...' : 'Verifikasi'}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={onBack}
          className="text-pink-400 hover:text-pink-300 font-medium text-sm"
        >
          Kembali ke pendaftaran
        </button>
      </div>
    </form>
  );
};
