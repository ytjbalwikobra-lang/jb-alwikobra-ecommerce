import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import PhoneInput from '../components/PhoneInput';
import { AuthRequired } from '../components/ProtectedRoute';
import { useAuth } from '../contexts/TraditionalAuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useConfirmation } from '../components/ConfirmationModal';
import { useToast } from '../components/Toast';
import { supabase } from '../services/supabase';
import { IOSContainer, IOSCard, IOSButton } from '../components/ios/IOSDesignSystem';

interface UserProfile {
  name: string;
  email: string;
  whatsapp: string;
  joinDate: string;
  totalOrders: number;
  wishlistCount: number;
}

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { wishlistItems } = useWishlist();
  const { confirm } = useConfirmation();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || '',
    email: user?.email || '',
    whatsapp: user?.phone || '',
    joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID'),
    totalOrders: 0,
    wishlistCount: wishlistItems.length
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isValidPhone, setIsValidPhone] = useState(false);

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: 'Konfirmasi Logout',
      message: 'Yakin ingin keluar dari akun Anda?',
      type: 'warning',
      confirmText: 'Ya, Keluar',
      cancelText: 'Batal',
      showCancel: true
    });

    if (confirmed) {
      await logout();
      showToast('Berhasil logout', 'success');
      navigate('/');
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Update wishlist count when wishlistItems change
  useEffect(() => {
    setProfile(prev => ({
      ...prev,
      wishlistCount: wishlistItems.length
    }));
  }, [wishlistItems]);

  // Fetch real order count when user is available
  useEffect(() => {
    const fetchOrderCount = async () => {
      if (!user || !supabase) return;
      
      try {
        const { count, error } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        if (!error && count !== null) {
          setProfile(prev => ({
            ...prev,
            totalOrders: count
          }));
        }
      } catch (error) {
        console.error('Error fetching order count:', error);
      }
    };

    fetchOrderCount();
  }, [user]);

  const loadProfile = () => {
    // Load from localStorage or API
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(prev => ({...prev, ...parsed}));
      setIsValidPhone(!!parsed.whatsapp);
    }
  };

  const saveProfile = async () => {
    if (!profile.name.trim() || !profile.email.trim()) {
      showToast('Nama dan email wajib diisi', 'error');
      return;
    }
    
    if (profile.whatsapp && !isValidPhone) {
      showToast('Silakan masukkan nomor WhatsApp yang valid', 'error');
      return;
    }

    const confirmed = await confirm({
      title: 'Simpan Perubahan',
      message: 'Yakin ingin menyimpan perubahan profil?',
      type: 'info',
      confirmText: 'Ya, Simpan',
      cancelText: 'Batal'
    });

    if (confirmed) {
      localStorage.setItem('userProfile', JSON.stringify(profile));
      setIsEditing(false);
      showToast('Profil berhasil disimpan', 'success');
    }
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
      <div className="min-h-screen bg-ios-background text-ios-text">
        <IOSContainer maxWidth="lg" className="pt-20 pb-20">
            {/* Profile Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500/15 via-purple-500/15 to-indigo-500/15 border border-ios-border backdrop-blur-sm mb-8">
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
                      <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-white/10">
                        <User size={40} className="text-white" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center ring-4 ring-black/50">
                        <Check size={16} className="text-white" />
                      </div>
                    </div>
                    
                    {/* User Details */}
                    <div>
                      <h1 className="text-3xl font-bold text-ios-text mb-2">
                        {profile.name || 'Pengguna Baru'}
                      </h1>
                      <p className="text-ios-text-secondary mb-1 flex items-center">
                        <Mail size={16} className="mr-2 text-ios-text-secondary" />
                        {profile.email}
                      </p>
                      <p className="text-ios-text-secondary text-sm flex items-center">
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
                        ? 'bg-red-500/15 border border-red-500/40 text-red-300 hover:bg-red-500/25'
                        : 'bg-ios-surface border border-ios-border text-ios-text hover:bg-white/10'
                    }`}
                  >
                    {isEditing ? <X size={20} /> : <Edit size={20} />}
                    <span>{isEditing ? 'Batal' : 'Edit Profil'}</span>
                  </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                  <div className="bg-ios-surface rounded-xl p-4 border border-ios-border transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Package size={20} className="text-blue-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-ios-text">{profile.totalOrders}</div>
                        <div className="text-ios-text-secondary text-sm">Pesanan</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-ios-surface rounded-xl p-4 border border-ios-border transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                        <Heart size={20} className="text-pink-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-ios-text">{profile.wishlistCount}</div>
                        <div className="text-ios-text-secondary text-sm">Wishlist</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-ios-surface rounded-xl p-4 border border-ios-border transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <Trophy size={20} className="text-yellow-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-ios-text">0</div>
                        <div className="text-ios-text-secondary text-sm">Poin</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-ios-surface rounded-xl p-4 border border-ios-border transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Crown size={20} className="text-purple-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-ios-text">Basic</div>
                        <div className="text-ios-text-secondary text-sm">Level</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Form Section */}
            {isEditing && (
              <IOSCard padding="large" className="bg-ios-surface border border-ios-border mb-8">
                <h2 className="text-xl font-semibold text-ios-text mb-6 flex items-center">
                  <Edit size={24} className="mr-3 text-pink-400" />
                  Edit Informasi Profil
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-ios-text-secondary mb-3">
                      <User size={16} className="inline mr-2" />
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      className="w-full bg-ios-surface border border-ios-border rounded-xl px-4 py-3 text-ios-text placeholder:text-ios-text-secondary focus:border-ios-accent focus:ring-2 focus:ring-ios-accent/30 transition-all"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ios-text-secondary mb-3">
                      <Mail size={16} className="inline mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      className="w-full bg-ios-surface border border-ios-border rounded-xl px-4 py-3 text-ios-text placeholder:text-ios-text-secondary focus:border-ios-accent focus:ring-2 focus:ring-ios-accent/30 transition-all"
                      placeholder="Masukkan email"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-ios-text-secondary mb-3">
                      <Phone size={16} className="inline mr-2" />
                      Nomor WhatsApp
                    </label>
                    <PhoneInput
                      value={profile.whatsapp}
                      onChange={(value) => setProfile({...profile, whatsapp: value})}
                      onValidationChange={setIsValidPhone}
                      placeholder="Masukkan Nomor WhatsApp"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <IOSButton fullWidth onClick={saveProfile}>
                    <div className="flex items-center gap-2">
                      <Check size={20} />
                      <span>Simpan Perubahan</span>
                    </div>
                  </IOSButton>
                  <IOSButton variant="secondary" fullWidth onClick={() => { setIsEditing(false); loadProfile(); }}>
                    <div className="flex items-center gap-2">
                      <X size={20} />
                      <span>Batal</span>
                    </div>
                  </IOSButton>
                </div>
              </IOSCard>
            )}

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {profileMenuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="group relative overflow-hidden rounded-2xl bg-ios-surface border border-ios-border transition-all transform hover:scale-[1.02] hover:shadow-xl hover:shadow-black/10 hover:border-ios-accent/50"
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
                          <h3 className="text-lg font-semibold text-ios-text group-hover:text-ios-text transition-colors">
                            {item.label}
                          </h3>
                          {item.count !== undefined && (
                            <p className="text-ios-text-secondary text-sm">{item.count} item</p>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-ios-text-secondary group-hover:text-ios-text transition-colors transform group-hover:translate-x-1" />
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
                className="group w-full bg-ios-surface rounded-2xl p-6 border border-ios-border transition-all transform hover:scale-[1.01] flex items-center justify-between hover:border-ios-accent/50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500/20 flex items-center justify-center">
                    <Shield size={20} className="text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-ios-text font-semibold transition-colors">
                      Bantuan & Dukungan
                    </h3>
                    <p className="text-ios-text-secondary text-sm">FAQ, Kontak Support, Panduan</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-ios-text-secondary transition-colors" />
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-2xl p-6 transition-all group"
              >
                <div className="flex items-center justify-center space-x-3">
                  <LogOut size={20} className="text-red-400" />
                  <span className="text-red-400 font-medium">Keluar dari Akun</span>
                </div>
              </button>
            </div>
          </IOSContainer>
      </div>
    </AuthRequired>
  );
};

export default ProfilePage;
