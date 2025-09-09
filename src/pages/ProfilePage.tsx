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
// import { uploadFile } from '../services/storageService.ts';

interface UserProfile {
  name: string;
  email: string;
  whatsapp: string;
  joinDate: string;
  totalOrders: number;
  wishlistCount: number;
  avatarUrl?: string;
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
    wishlistCount: wishlistItems.length,
    avatarUrl: user?.avatarUrl
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
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
      try {
        // Upload avatar first if selected (via server to bypass RLS)
        let avatar_url: string | undefined;
        if (avatarFile) {
          try {
            const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve((reader.result as string).split(',')[1] || '');
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            const token = localStorage.getItem('session_token') || '';
            const resUpload = await fetch('/api/auth?action=upload-avatar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ name: avatarFile.name, contentType: avatarFile.type || 'image/jpeg', dataBase64: await toBase64(avatarFile) })
            });
            const dataUpload = await resUpload.json();
            if (!resUpload.ok || !dataUpload?.publicUrl) throw new Error(dataUpload?.error || 'Upload gagal');
            avatar_url = dataUpload.publicUrl as string;
          } catch (e) {
            console.error('Avatar upload failed:', e);
            showToast('Upload avatar gagal, coba lagi', 'error');
          }
        }
        // Persist to database using admin API or direct client based on session
  const token = localStorage.getItem('session_token') || '';
        const res = await fetch('/api/auth?action=update-profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ name: profile.name, email: profile.email, phone: profile.whatsapp, ...(avatar_url ? { avatar_url } : (removeAvatar ? { avatar_url: '' } : {})) })
        });
        if (!res.ok) throw new Error('Gagal menyimpan profil');
        const data = await res.json();
        if (!data?.success) throw new Error(data?.error || 'Gagal menyimpan profil');
  // Update local auth user and storage
        const updatedUser = { ...(user as any), name: data.user?.name ?? profile.name, email: data.user?.email ?? profile.email, phone: data.user?.phone ?? profile.whatsapp, avatarUrl: data.user?.avatar_url ?? avatar_url ?? (user as any)?.avatarUrl };
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        setProfile(p=>({ ...p, avatarUrl: updatedUser.avatarUrl }));
        if (avatarPreview) { try { URL.revokeObjectURL(avatarPreview); } catch {} }
  setAvatarFile(null);
        setAvatarPreview(null);
  setRemoveAvatar(false);
        setIsEditing(false);
        showToast('Profil berhasil disimpan', 'success');
  try { localStorage.setItem('feed_cache_buster', String(Date.now())); } catch {}
      } catch (e:any) {
        console.error('Save profile error:', e);
        showToast(e.message || 'Gagal menyimpan profil', 'error');
      }
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
      <div className="min-h-screen">
        <div className="pt-20 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Profile Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-950 via-gray-900 to-black border border-white/10 backdrop-blur mb-6">
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
                      <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden shadow">
                        {profile.avatarUrl ? (
                          <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User size={32} className="text-white/90" />
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center ring-4 ring-gray-950">
                        <Check size={16} className="text-white" />
                      </div>
                    </div>
                    
                    {/* User Details */}
                    <div>
                      <h1 className="text-2xl font-bold text-white mb-1">
                        {profile.name || 'Pengguna Baru'}
                      </h1>
                      <p className="text-gray-300 mb-1 flex items-center">
                        <Mail size={16} className="mr-2" />
                        {profile.email}
                      </p>
                      <p className="text-gray-400 text-sm flex items-center">
                        <Star size={16} className="mr-2 text-yellow-400" />
                        Member sejak {profile.joinDate}
                      </p>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                      isEditing 
                        ? 'bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20' 
                        : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    {isEditing ? <X size={20} /> : <Edit size={20} />}
                    <span>{isEditing ? 'Batal' : 'Edit Profil'}</span>
                  </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
                  <div className="bg-white/5 backdrop-blur rounded-lg p-4 border border-white/10 hover:border-pink-400/40 transition-colors">
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
                  
                  <div className="bg-white/5 backdrop-blur rounded-lg p-4 border border-white/10 hover:border-pink-400/40 transition-colors">
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
                  
                  <div className="bg-white/5 backdrop-blur rounded-lg p-4 border border-white/10 hover:border-pink-400/40 transition-colors">
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
                  
                  <div className="bg-white/5 backdrop-blur rounded-lg p-4 border border-white/10 hover:border-pink-400/40 transition-colors">
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
              <div className="bg-black/50 backdrop-blur rounded-2xl p-6 border border-white/10 mb-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Edit size={24} className="mr-3 text-pink-400" />
                  Edit Informasi Profil
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Foto Profil</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                        {avatarPreview ? (
                          <img src={avatarPreview} className="w-full h-full object-cover" alt="avatar preview" />
                        ) : profile.avatarUrl ? (
                          <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
                        ) : (
                          <User className="text-white/80" size={24} />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="px-3 py-2 text-sm border border-white/10 rounded-lg hover:bg-white/5 cursor-pointer">
                          Pilih Foto
                          <input type="file" accept="image/*" className="hidden" onChange={e=>{
                            const f = e.target.files?.[0] || null;
                            setAvatarFile(f);
                            if (avatarPreview) { try { URL.revokeObjectURL(avatarPreview); } catch {} }
                            setAvatarPreview(f ? URL.createObjectURL(f) : null);
                          }} />
                        </label>
                        {(profile.avatarUrl || avatarPreview) && (
                          <button type="button" onClick={()=>{ setAvatarFile(null); if (avatarPreview) { try { URL.revokeObjectURL(avatarPreview); } catch {} } setAvatarPreview(null); setProfile(p=>({...p, avatarUrl: undefined })); setRemoveAvatar(true); }} className="px-3 py-2 text-sm border border-white/10 rounded-lg hover:bg-white/5">Hapus</button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      <User size={16} className="inline mr-2" />
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30"
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
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30"
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
                      placeholder="Masukkan Nomor WhatsApp"
                      className="w-full"
                    />
                  </div>
                </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={saveProfile}
          className="flex-1 bg-pink-600 hover:bg-pink-500 text-white py-2.5 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Check size={20} />
                    <span>Simpan Perubahan</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      loadProfile();
                    }}
          className="flex-1 bg-white/5 hover:bg-white/10 text-gray-200 py-2.5 px-6 rounded-lg font-medium transition-colors border border-white/10 flex items-center justify-center space-x-2"
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
                  className="group relative overflow-hidden rounded-2xl bg-black/40 backdrop-blur border border-white/10 hover:border-pink-400/40 transition-transform hover:scale-[1.01]"
                >
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="relative p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${item.color} bg-white/5 border border-white/10`}>
                          <item.icon size={24} />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-white group-hover:text-pink-300 transition-colors">
                            {item.label}
                          </h3>
                          {item.count !== undefined && (
                            <p className="text-gray-400 text-sm">{item.count} item</p>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-400 group-hover:text-pink-400 transition-colors transform group-hover:translate-x-1" />
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
                className="group w-full bg-black/40 backdrop-blur rounded-2xl p-6 border border-white/10 hover:border-yellow-400/40 transition-transform hover:scale-[1.01] flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-11 h-11 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
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
                onClick={handleLogout}
                className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-2xl p-6 transition-colors group"
              >
                <div className="flex items-center justify-center space-x-3">
                  <LogOut size={20} className="text-red-400" />
                  <span className="text-red-400 font-medium">Keluar dari Akun</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthRequired>
  );
};

export default ProfilePage;
