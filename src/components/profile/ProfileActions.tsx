import React from 'react';
import { LogOut, Save, X } from 'lucide-react';

interface ProfileActionsProps {
  isEditing: boolean;
  hasChanges: boolean;
  saveLoading: boolean;
  isValidPhone: boolean;
  onSave: () => void;
  onCancel: () => void;
  onLogout: () => void;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({
  isEditing,
  hasChanges,
  saveLoading,
  isValidPhone,
  onSave,
  onCancel,
  onLogout
}) => {
  if (isEditing) {
    return (
      <div className="bg-black/40 backdrop-blur rounded-3xl p-8 border border-white/10">
        <div className="flex space-x-4">
          <button
            onClick={onSave}
            disabled={saveLoading || !hasChanges || !isValidPhone}
            className="flex-1 flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-3 px-6 rounded-xl transition-colors"
          >
            <Save size={20} />
            <span>{saveLoading ? 'Menyimpan...' : 'Simpan Profil'}</span>
          </button>
          
          <button
            onClick={onCancel}
            disabled={saveLoading}
            className="flex-1 flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl border border-white/20 transition-colors"
          >
            <X size={20} />
            <span>Batal</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur rounded-3xl p-8 border border-white/10">
      <h2 className="text-xl font-bold text-white mb-6">Aksi Akun</h2>
      
      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center space-x-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-2xl p-6 transition-colors group"
      >
        <LogOut size={20} className="text-red-400" />
        <span className="text-red-400 font-medium">Keluar dari Akun</span>
      </button>
    </div>
  );
};

export default ProfileActions;
