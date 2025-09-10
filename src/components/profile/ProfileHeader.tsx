import React from 'react';
import { User, LogOut } from 'lucide-react';

interface ProfileHeaderProps {
  profile: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout: () => Promise<void>;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, onLogout }) => {
  return (
    <div className="bg-black rounded-xl border border-pink-500/40 p-6 mb-8">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <User className="text-white" size={32} />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{profile.name || 'User'}</h1>
            <p className="text-gray-400">{profile.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileHeader;
