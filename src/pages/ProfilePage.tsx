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
  Star,
  Trophy,
  Crown,
  Shield,
  Zap,
  Check,
  X
} from 'lucide-react';
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
      setProfile(prev => ({...prev, ...parsed}));
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
      <div className="min-h-screen">
        <div className="pt-20 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Profile Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 border border-pink-500/30 backdrop-blur-sm mb-8">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
              
              <div className="relative p-8">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  {/* User Info */}
                  <div className="flex items-center space-x-6">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-pink-400/20">
                        <User size={40} className="text-white" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center ring-4 ring-gray-900">
                        <Check size={16} className="text-white" />
                      </div>
                    </div>
                    
                    {/* User Details */}
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">
                        {profile.name || 'Pengguna Baru'}
                      </h1>
                      <p className="text-pink-300 mb-1 flex items-center">
                        <Mail size={16} className="mr-2" />
                        {profile.email}
                      </p>
                      <p className="text-gray-300 text-sm flex items-center">
                        <Star size={16} className="mr-2 text-yellow-400" />
                        Member sejak {profile.joinDate}
                      </p>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 flex items-center space-x-2 ${
                      isEditing 
                        ? 'bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30' 
                        : 'bg-pink-500/20 border border-pink-500/50 text-pink-300 hover:bg-pink-500/30'
                    }`}
                  >
                    {isEditing ? <X size={20} /> : <Edit size={20} />}
                    <span>{isEditing ? 'Batal' : 'Edit Profil'}</span>
                  </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                  <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10 hover:border-pink-400/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Package size={20} className="text-blue-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{profile.totalOrders}</div>
                        <div className="text-gray-400 text-sm">Pesanan</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10 hover:border-pink-400/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                        <Heart size={20} className="text-pink-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{profile.wishlistCount}</div>
                        <div className="text-gray-400 text-sm">Wishlist</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10 hover:border-pink-400/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <Trophy size={20} className="text-yellow-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">0</div>
                        <div className="text-gray-400 text-sm">Poin</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10 hover:border-pink-400/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Crown size={20} className="text-purple-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">Basic</div>
                        <div className="text-gray-400 text-sm">Level</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Form Section */}
            {isEditing && (
              <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-6 border border-gray-700/50 mb-8">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Edit size={24} className="mr-3 text-pink-400" />
                  Edit Informasi Profil
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      <User size={16} className="inline mr-2" />
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      <Mail size={16} className="inline mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                      placeholder="Masukkan email"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      <Phone size={16} className="inline mr-2" />
                      Nomor WhatsApp
                    </label>
                    <PhoneInput
                      value={profile.whatsapp}
                      onChange={(value) => setProfile({...profile, whatsapp: value})}
                      onValidationChange={setIsValidPhone}
                      placeholder="Contoh: 812345678901"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <button
                    onClick={saveProfile}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-3 px-6 rounded-xl font-medium transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                  >
                    <Check size={20} />
                    <span>Simpan Perubahan</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      loadProfile();
                    }}
                    className="flex-1 bg-gray-700/50 hover:bg-gray-700 text-gray-300 py-3 px-6 rounded-xl font-medium transition-all border border-gray-600/50 flex items-center justify-center space-x-2"
                  >
                    <X size={20} />
                    <span>Batal</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {profileMenuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="group relative overflow-hidden rounded-2xl bg-gray-900/50 backdrop-blur border border-gray-700/50 hover:border-pink-500/50 transition-all transform hover:scale-[1.02] hover:shadow-xl hover:shadow-pink-500/10"
                >
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="relative p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${item.color} bg-opacity-20 border border-current border-opacity-20`}>
                          <item.icon size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white group-hover:text-pink-300 transition-colors">
                            {item.label}
                          </h3>
                          {item.count !== undefined && (
                            <p className="text-gray-400 text-sm">{item.count} item</p>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-gray-400 group-hover:text-pink-400 transition-colors transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Additional Actions */}
            <div className="space-y-4">
              {/* Help & Support */}
              <Link
                to="/help"
                className="group w-full bg-gray-900/50 backdrop-blur rounded-2xl p-6 border border-gray-700/50 hover:border-yellow-500/50 transition-all transform hover:scale-[1.01] flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500/20 flex items-center justify-center">
                    <Shield size={20} className="text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold group-hover:text-yellow-300 transition-colors">
                      Bantuan & Dukungan
                    </h3>
                    <p className="text-gray-400 text-sm">FAQ, Kontak Support, Panduan</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400 group-hover:text-yellow-400 transition-colors" />
              </Link>

              {/* Logout Button */}
              <button
                onClick={() => {
                  if (confirm('Yakin ingin keluar dari akun?')) {
                    signOut();
                  }
                }}
                className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-2xl p-6 transition-all group"
              >
                <div className="flex items-center justify-center space-x-3">
                  <LogOut size={20} className="text-red-400" />
                  <span className="text-red-400 font-medium">Keluar dari Akun</span>
                </div>
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
