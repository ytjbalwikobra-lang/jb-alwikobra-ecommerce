import React from 'react';
import { MessageCircle, ArrowRight } from 'lucide-react';

interface SellFormData {
  selectedGame: string;
  accountLevel: string;
  estimatedPrice: string;
  accountDetails: string;
}

interface SellFormProps {
  formData: SellFormData;
  gameOptions: string[];
  onFormChange: (field: keyof SellFormData, value: string) => void;
  onPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

const SellForm: React.FC<SellFormProps> = ({
  formData,
  gameOptions,
  onFormChange,
  onPriceChange,
  onSubmit,
}) => {
  return (
    <section id="form" className="py-16 bg-black/60 border-t border-pink-500/20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-black/60 border border-pink-500/40 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-center text-white mb-8">
            Jual Akun Game Anda
          </h2>
          
          <div className="space-y-6">
            {/* Game Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Pilih Game <span className="text-pink-400">*</span>
              </label>
              <select
                value={formData.selectedGame}
                onChange={(e) => onFormChange('selectedGame', e.target.value)}
                className="w-full px-4 py-3 border border-pink-500/40 bg-black text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              >
                <option value="">Pilih game yang ingin dijual</option>
                {gameOptions.map((game, index) => (
                  <option key={index} value={game}>
                    {game}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Level */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Level/Rank Akun
              </label>
              <input
                type="text"
                value={formData.accountLevel}
                onChange={(e) => onFormChange('accountLevel', e.target.value)}
                className="w-full px-4 py-3 border border-pink-500/40 bg-black text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Contoh: Mythic Glory, Conqueror, dll"
              />
            </div>

            {/* Estimated Price */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estimasi Harga (Opsional)
              </label>
              <input
                type="text"
                value={formData.estimatedPrice}
                onChange={onPriceChange}
                className="w-full px-4 py-3 border border-pink-500/40 bg-black text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Contoh: Rp 2,000,000"
              />
            </div>

            {/* Account Details */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Detail Akun
              </label>
              <textarea
                value={formData.accountDetails}
                onChange={(e) => onFormChange('accountDetails', e.target.value)}
                className="w-full px-4 py-3 border border-pink-500/40 bg-black text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                rows={3}
                placeholder="Skin, hero, item khusus, dll"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 text-center">
            <button
              onClick={onSubmit}
              className="bg-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-pink-700 transition-colors flex items-center justify-center space-x-2 mx-auto"
            >
              <MessageCircle size={20} />
              <span>Hubungi Admin untuk Evaluasi</span>
              <ArrowRight size={20} />
            </button>
            <p className="text-sm text-gray-400 mt-4">
              Admin akan menghubungi Anda untuk evaluasi lebih lanjut
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SellForm;
