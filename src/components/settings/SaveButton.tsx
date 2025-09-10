import React from 'react';
import { Save } from 'lucide-react';

interface SaveButtonProps {
  onSave: () => void;
}

export const SaveButton: React.FC<SaveButtonProps> = ({ onSave }) => {
  return (
    <button
      onClick={onSave}
      className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
    >
      <Save size={20} />
      <span>Simpan Pengaturan</span>
    </button>
  );
};
