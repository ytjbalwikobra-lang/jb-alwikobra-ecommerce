import React from 'react';
import { Shield } from 'lucide-react';
import { ToggleSwitch } from './ToggleSwitch';

interface PrivacySettingsProps {
  privacy: {
    showProfile: boolean;
    showOrders: boolean;
    allowMarketing: boolean;
  };
  onPrivacyChange: (key: 'showProfile' | 'showOrders' | 'allowMarketing', value: boolean) => void;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  privacy,
  onPrivacyChange
}) => {
  return (
    <div className="bg-black/40 backdrop-blur rounded-xl p-6 border border-pink-500/30">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Shield size={20} className="mr-2" />
        Privasi
      </h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white">Profil Publik</div>
            <div className="text-gray-400 text-sm">Tampilkan profil di leaderboard</div>
          </div>
          <ToggleSwitch
            checked={privacy.showProfile}
            onChange={(value) => onPrivacyChange('showProfile', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-white">Riwayat Pesanan</div>
            <div className="text-gray-400 text-sm">Sembunyikan riwayat pesanan dari publik</div>
          </div>
          <ToggleSwitch
            checked={privacy.showOrders}
            onChange={(value) => onPrivacyChange('showOrders', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-white">Email Marketing</div>
            <div className="text-gray-400 text-sm">Terima email promo dan penawaran</div>
          </div>
          <ToggleSwitch
            checked={privacy.allowMarketing}
            onChange={(value) => onPrivacyChange('allowMarketing', value)}
          />
        </div>
      </div>
    </div>
  );
};
