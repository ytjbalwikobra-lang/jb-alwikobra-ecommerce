import React from 'react';
import { User, Mail, Phone, Calendar, Users, FileText } from 'lucide-react';
import SmartPhoneInput from '../SmartPhoneInput';

export interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  dateOfBirth: string;
  gender: string;
  bio: string;
  notificationPreferences: {
    whatsapp: boolean;
    email: boolean;
  };
}

interface ProfileFormProps {
  profile: ProfileFormData;
  onProfileChange: (field: keyof ProfileFormData, value: string) => void;
  onNotificationChange: (type: 'whatsapp' | 'email', value: boolean) => void;
  isEditing: boolean;
  isValidPhone: boolean;
  onPhoneValidationChange: (isValid: boolean) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  onProfileChange,
  onNotificationChange,
  isEditing,
  onPhoneValidationChange,
}) => {
  if (!isEditing) {
    return (
      <div className="bg-black/40 backdrop-blur rounded-3xl p-8 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Informasi Profil</h2>
        
        <div className="space-y-6">
          {/* Name */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <User size={20} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Nama Lengkap</p>
              <p className="text-white font-medium">{profile.name || 'Belum diisi'}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Mail size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Email</p>
              <p className="text-white font-medium">{profile.email || 'Belum diisi'}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Phone size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">WhatsApp</p>
              <p className="text-white font-medium">{profile.phone || 'Belum diisi'}</p>
            </div>
          </div>

          {/* Date of Birth */}
          {profile.dateOfBirth && (
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Calendar size={20} className="text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Tanggal Lahir</p>
                <p className="text-white font-medium">{profile.dateOfBirth}</p>
              </div>
            </div>
          )}

          {/* Gender */}
          {profile.gender && (
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                <Users size={20} className="text-pink-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Jenis Kelamin</p>
                <p className="text-white font-medium">{profile.gender}</p>
              </div>
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <FileText size={20} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Bio</p>
                <p className="text-white font-medium">{profile.bio}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur rounded-3xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6">Edit Profil</h2>
      
      <div className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Nama Lengkap
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => onProfileChange('name', e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20"
            placeholder="Masukkan nama lengkap"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => onProfileChange('email', e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20"
            placeholder="Masukkan email"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Nomor WhatsApp
          </label>
          <SmartPhoneInput
            value={profile.phone}
            onChange={(value: string) => {
              onProfileChange('phone', value);
              // Simple validation: check if value looks like a phone number
              const isValid = value.length >= 10 && /^\+?[\d\s-()]+$/.test(value);
              onPhoneValidationChange(isValid);
            }}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20"
            placeholder="Masukkan nomor WhatsApp"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Tanggal Lahir
          </label>
          <input
            type="date"
            value={profile.dateOfBirth}
            onChange={(e) => onProfileChange('dateOfBirth', e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Jenis Kelamin
          </label>
          <select
            value={profile.gender}
            onChange={(e) => onProfileChange('gender', e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20"
          >
            <option value="">Pilih jenis kelamin</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Bio
          </label>
          <textarea
            value={profile.bio}
            onChange={(e) => onProfileChange('bio', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20"
            placeholder="Ceritakan tentang diri Anda"
            maxLength={200}
          />
          <p className="text-gray-400 text-sm mt-2">
            {profile.bio.length}/200 karakter
          </p>
        </div>

        {/* Notification Preferences */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-4">
            Preferensi Notifikasi
          </label>
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={profile.notificationPreferences.whatsapp}
                onChange={(e) => onNotificationChange('whatsapp', e.target.checked)}
                className="w-4 h-4 text-yellow-400 bg-transparent border-2 border-white/20 rounded focus:ring-yellow-400 focus:ring-2"
              />
              <span className="text-white">Notifikasi WhatsApp</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={profile.notificationPreferences.email}
                onChange={(e) => onNotificationChange('email', e.target.checked)}
                className="w-4 h-4 text-yellow-400 bg-transparent border-2 border-white/20 rounded focus:ring-yellow-400 focus:ring-2"
              />
              <span className="text-white">Notifikasi Email</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
