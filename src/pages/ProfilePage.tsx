import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  ShoppingBag, 
  Heart, 
  Settings, 
  LogOut, 
  Edit,
  ChevronRight,
  Package,
  Star
} from 'lucide-react';
import Header from '../components/Header.tsx';
import Footer from '../components/Footer.tsx';
import PhoneInput from '../components/PhoneInput.tsx';
import { AuthRequired } from '../components/ProtectedRoute.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

interface UserProfile {
  name: string;
  email: string;
  whatsapp: string;
  joinDate: string;
  totalOrders: number;
  wishlistCount: number;
}

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.user_metadata?.name || user?.email?.split('@')[0] || '',
    email: user?.email || '',
    whatsapp: user?.user_metadata?.whatsapp || '',
    joinDate: user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID'),
    totalOrders: 0,
    wishlistCount: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isValidPhone, setIsValidPhone] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    // Load from localStorage or API
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(parsed);
      setIsValidPhone(!!parsed.whatsapp);
    }
  };

  const saveProfile = () => {
    if (!profile.name.trim() || !profile.email.trim()) {
      alert('Nama dan email wajib diisi');
      return;
    }
    
    if (profile.whatsapp && !isValidPhone) {
      alert('Silakan masukkan nomor WhatsApp yang valid');
      return;
    }

    localStorage.setItem('userProfile', JSON.stringify(profile));
    setIsEditing(false);
    alert('Profil berhasil disimpan');
  };

  const profileMenuItems = [
    {
      icon: Package,
      label: 'Riwayat Pesanan',
      path: '/orders',
      count: profile.totalOrders,
      color: 'text-blue-400'
    },
    {
      icon: Heart,
      label: 'Wishlist',
      path: '/wishlist',
      count: profile.wishlistCount,
      color: 'text-pink-400'
    },
    {
      icon: Settings,
      label: 'Pengaturan',
      path: '/settings',
      color: 'text-gray-400'
    }
  ];

  return (
    <AuthRequired>
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900">
        <Header />
        
        <div className="pt-20 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="bg-black/40 backdrop-blur rounded-xl p-6 mb-6 border border-pink-500/30">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {profile.name || 'Pengguna Baru'}
                  </h1>
                  <p className="text-gray-300">Bergabung sejak {profile.joinDate}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Edit size={16} />
                <span>{isEditing ? 'Batal' : 'Edit'}</span>
              </button>
            </div>

            {/* Profile Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-500/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{profile.totalOrders}</div>
                <div className="text-gray-300 text-sm">Total Pesanan</div>
              </div>
              <div className="bg-pink-500/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-pink-400">{profile.wishlistCount}</div>
                <div className="text-gray-300 text-sm">Wishlist</div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User size={16} className="inline mr-2" />
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  disabled={!isEditing}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white disabled:opacity-50 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  disabled={!isEditing}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white disabled:opacity-50 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  placeholder="Masukkan email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Phone size={16} className="inline mr-2" />
                  Nomor WhatsApp
                </label>
                {isEditing ? (
                  <PhoneInput
                    value={profile.whatsapp}
                    onChange={(value) => setProfile({...profile, whatsapp: value})}
                    onValidationChange={setIsValidPhone}
                    placeholder="Contoh: 812345678901"
                  />
                ) : (
                  <input
                    type="text"
                    value={profile.whatsapp ? `+62${profile.whatsapp}` : ''}
                    disabled
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white disabled:opacity-50"
                    placeholder="Belum diisi"
                  />
                )}
              </div>

              {isEditing && (
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={saveProfile}
                    className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    Simpan Profil
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      loadProfile();
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            {profileMenuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="bg-black/40 backdrop-blur rounded-xl p-4 border border-pink-500/30 flex items-center justify-between hover:bg-black/60 transition-colors group"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-lg bg-gray-800/50 flex items-center justify-center ${item.color}`}>
                    <item.icon size={20} />
                  </div>
                  <div>
                    <div className="text-white font-medium">{item.label}</div>
                    {item.count !== undefined && (
                      <div className="text-gray-400 text-sm">{item.count} item</div>
                    )}
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400 group-hover:text-pink-400 transition-colors" />
              </Link>
            ))}

            {/* Help & Support */}
            <Link
              to="/help"
              className="bg-black/40 backdrop-blur rounded-xl p-4 border border-pink-500/30 flex items-center justify-between hover:bg-black/60 transition-colors group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-lg bg-gray-800/50 flex items-center justify-center text-yellow-400">
                  <Star size={20} />
                </div>
                <div>
                  <div className="text-white font-medium">Bantuan & Dukungan</div>
                  <div className="text-gray-400 text-sm">FAQ, Kontak Support</div>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400 group-hover:text-pink-400 transition-colors" />
            </Link>

            {/* Logout Button */}
            <button
              onClick={async () => {
                if (confirm('Yakin ingin keluar?')) {
                  await signOut();
                  window.location.href = '/';
                }
              }}
              className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl p-4 flex items-center justify-center space-x-3 text-red-400 hover:text-red-300 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Keluar</span>
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
    </AuthRequired>
  );
};

export default ProfilePage;
