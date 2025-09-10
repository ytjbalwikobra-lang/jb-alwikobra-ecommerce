import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/TraditionalAuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../components/Toast';
import { useConfirmation } from '../components/ConfirmationModal';

interface UploadResponse {
  url: string;
  error?: string;
}

interface SaveProfileResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bio: string;
  avatar: string;
  notificationPreferences: {
    whatsapp: boolean;
    email: boolean;
  };
  level: number;
  points: number;
  orderCount: number;
  wishlistCount: number;
}

export const useProfilePage = () => {
  const { user, logout } = useAuth();
  const { wishlistItems } = useWishlist();
  const { showToast } = useToast();
  const { confirm } = useConfirmation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    bio: '',
    avatar: '',
    notificationPreferences: {
      whatsapp: true,
      email: true,
    },
    level: 1,
    points: 0,
    orderCount: 0,
    wishlistCount: 0,
  });

  const [originalProfile, setOriginalProfile] = useState<ProfileData>(profile);
  const [uploading, setUploading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isValidPhone, setIsValidPhone] = useState(false);

  // Initialize profile data
  const loadProfile = useCallback(() => {
    if (user) {
      const profileData: ProfileData = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        bio: user.bio || '',
        avatar: user.avatarUrl || '',
        notificationPreferences: user.notificationPreferences || {
          whatsapp: true,
          email: true,
        },
        level: 1,
        points: 0,
        orderCount: 0,
        wishlistCount: wishlistItems.length,
      };
      setProfile(profileData);
      setOriginalProfile(profileData);
    }
  }, [user, wishlistItems.length]);

  // Load order count from API
  const loadOrderCount = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/admin?action=getUserOrderCount&userId=${user.id}`);
      if (response.ok) {
        const data = await response.json() as { count: number };
        setProfile(prev => ({
          ...prev,
          orderCount: data.count || 0
        }));
      }
    } catch (error) {
      console.error('Failed to load order count:', error);
    }
  }, [user?.id]);

  // Handle avatar upload
  const handleAvatarUpload = async (file: File): Promise<string | null> => {
    if (!user?.id) return null;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('userId', user.id);

      const response = await fetch('/api/auth?action=upload-avatar', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json() as UploadResponse;
        showToast('Avatar berhasil diupload', 'success');
        return data.url;
      } else {
        const errorData = await response.json() as UploadResponse;
        showToast(errorData.error || 'Gagal upload avatar', 'error');
        return null;
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      showToast('Terjadi kesalahan saat upload avatar', 'error');
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Handle avatar change
  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      showToast('File harus berupa gambar', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran file maksimal 5MB', 'error');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload avatar
    const uploadedUrl = await handleAvatarUpload(file);
    if (uploadedUrl) {
      setProfile(prev => ({
        ...prev,
        avatar: uploadedUrl
      }));
      setRemoveAvatar(false);
    } else {
      setAvatarPreview(null);
    }
  };

  // Handle remove avatar
  const handleRemoveAvatar = () => {
    setProfile(prev => ({
      ...prev,
      avatar: ''
    }));
    setAvatarPreview(null);
    setRemoveAvatar(true);
  };

  // Handle profile save
  const handleSaveProfile = async () => {
    if (!user?.id) return;

    setSaveLoading(true);
    try {
      const response = await fetch('/api/auth?action=update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          dateOfBirth: profile.dateOfBirth,
          gender: profile.gender,
          bio: profile.bio,
          avatarUrl: removeAvatar ? null : profile.avatar,
          notificationPreferences: profile.notificationPreferences,
        }),
      });

      if (response.ok) {
        const data = await response.json() as SaveProfileResponse;
        if (data.success) {
          showToast('Profil berhasil disimpan', 'success');
          setOriginalProfile(profile);
          setIsEditing(false);
          setRemoveAvatar(false);
          setAvatarPreview(null);
          
          // Update user data in localStorage
          const userData = localStorage.getItem('user_data');
          if (userData) {
            const currentUser = JSON.parse(userData) as Record<string, any>;
            const updatedUser = {
              ...currentUser,
              name: profile.name,
              email: profile.email,
              phone: profile.phone,
              dateOfBirth: profile.dateOfBirth,
              gender: profile.gender,
              bio: profile.bio,
              avatarUrl: removeAvatar ? undefined : profile.avatar,
              notificationPreferences: profile.notificationPreferences,
            };
            localStorage.setItem('user_data', JSON.stringify(updatedUser));
          }
        } else {
          showToast(data.message || 'Gagal menyimpan profil', 'error');
        }
      } else {
        const errorData = await response.json() as SaveProfileResponse;
        showToast(errorData.error || 'Gagal menyimpan profil', 'error');
      }
    } catch (error) {
      console.error('Save profile error:', error);
      showToast('Terjadi kesalahan saat menyimpan profil', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle logout
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

  // Handle cancel editing
  const handleCancelEdit = () => {
    setProfile(originalProfile);
    setIsEditing(false);
    setAvatarPreview(null);
    setRemoveAvatar(false);
  };

  // Handle field changes
  const handleProfileChange = (field: keyof ProfileData, value: string | boolean | object) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle notification preference change
  const handleNotificationChange = (type: 'whatsapp' | 'email', value: boolean) => {
    setProfile(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [type]: value
      }
    }));
  };

  // Check if profile has changes
  const hasChanges = JSON.stringify(profile) !== JSON.stringify(originalProfile) || avatarPreview !== null || removeAvatar;

  // Effects
  useEffect(() => {
    loadProfile();
  }, [user, loadProfile]);

  useEffect(() => {
    setProfile(prev => ({
      ...prev,
      wishlistCount: wishlistItems.length
    }));
  }, [wishlistItems]);

  useEffect(() => {
    if (user?.id) {
      void loadOrderCount();
    }
  }, [user?.id, loadOrderCount]);

  return {
    profile,
    uploading,
    saveLoading,
    avatarPreview,
    removeAvatar,
    isEditing,
    isValidPhone,
    hasChanges,
    setIsEditing,
    setIsValidPhone,
    handleAvatarChange,
    handleRemoveAvatar,
    handleSaveProfile,
    handleLogout,
    handleCancelEdit,
    handleProfileChange,
    handleNotificationChange,
    loadProfile,
  };
};

export default useProfilePage;
