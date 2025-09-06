import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/TraditionalAuthContext.tsx';
import { useToast } from '../components/Toast.tsx';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'verify' | 'complete'>('login');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, signup, verifyPhone, completeProfile } = useAuth();
  const { showToast } = useToast();

  // Login form state
  const [loginData, setLoginData] = useState({
    identifier: '', // phone or email
    password: ''
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Verification state
  const [verificationData, setVerificationData] = useState({
    userId: '',
    code: ''
  });

  // Profile completion state
  const [profileData, setProfileData] = useState({
    email: '',
    name: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(loginData.identifier, loginData.password);
      
      if (result.error) {
        showToast(result.error, 'error');
        return;
      }

      showToast('Login berhasil!', 'success');
      
      // Check if profile is completed
      if (!result.profileCompleted) {
        setMode('complete');
        return;
      }

      // Redirect to intended page or home
      const redirect = searchParams.get('redirect');
      navigate(redirect || '/', { replace: true });
      
    } catch (error) {
      showToast('Terjadi kesalahan. Silakan coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      showToast('Password tidak cocok', 'error');
      return;
    }

    if (signupData.password.length < 6) {
      showToast('Password minimal 6 karakter', 'error');
      return;
    }

    setLoading(true);

    try {
      const result = await signup(signupData.phone, signupData.password);
      
      if (result.error) {
        showToast(result.error, 'error');
        return;
      }

      setVerificationData({ userId: result.userId!, code: '' });
      setMode('verify');
      showToast(result.message || 'Kode verifikasi telah dikirim ke WhatsApp', 'success');
      
    } catch (error) {
      showToast('Terjadi kesalahan. Silakan coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await verifyPhone(verificationData.userId, verificationData.code);
      
      if (result.error) {
        showToast(result.error, 'error');
        return;
      }

      showToast('Nomor HP berhasil diverifikasi!', 'success');
      setMode('complete');
      
    } catch (error) {
      showToast('Terjadi kesalahan. Silakan coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await completeProfile(profileData.email, profileData.name);
      
      if (result.error) {
        showToast(result.error, 'error');
        return;
      }

      showToast('Profil berhasil dilengkapi! Selamat datang!', 'success');
      
      // Redirect to intended page or home
      const redirect = searchParams.get('redirect');
      navigate(redirect || '/', { replace: true });
      
    } catch (error) {
      showToast('Terjadi kesalahan. Silakan coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // If starts with 0, replace with 62
    if (digits.startsWith('0')) {
      return '62' + digits.slice(1);
    }
    
    // If doesn't start with 62, add it
    if (!digits.startsWith('62') && digits.length > 0) {
      return '62' + digits;
    }
    
    return digits;
  };

  return (
    <div className="min-h-screen bg-app-dark flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-black/60 backdrop-blur border border-pink-500/30 rounded-xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              {mode === 'login' && 'Masuk ke Akun'}
              {mode === 'signup' && 'Daftar Akun Baru'}
              {mode === 'verify' && 'Verifikasi WhatsApp'}
              {mode === 'complete' && 'Lengkapi Profil'}
            </h1>
            <p className="text-gray-400 text-sm">
              {mode === 'login' && 'Masukkan nomor HP/email dan password'}
              {mode === 'signup' && 'Buat akun dengan nomor WhatsApp'}
              {mode === 'verify' && 'Masukkan kode yang dikirim ke WhatsApp'}
              {mode === 'complete' && 'Tambahkan email dan nama lengkap'}
            </p>
          </div>

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nomor HP atau Email
                </label>
                <input
                  type="text"
                  value={loginData.identifier}
                  onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="62812345678 atau email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Masukkan password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-pink-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Masuk...' : 'Masuk'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-pink-400 hover:text-pink-300 text-sm font-medium"
                >
                  Belum punya akun? Daftar di sini
                </button>
              </div>
            </form>
          )}

          {/* Signup Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  value={signupData.phone}
                  onChange={(e) => setSignupData({ 
                    ...signupData, 
                    phone: formatPhoneNumber(e.target.value)
                  })}
                  className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="628123456789"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Kode verifikasi akan dikirim ke nomor ini
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Minimal 6 karakter"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Ulangi password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-pink-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Mendaftar...' : 'Daftar'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-pink-400 hover:text-pink-300 text-sm font-medium"
                >
                  Sudah punya akun? Masuk di sini
                </button>
              </div>
            </form>
          )}

          {/* Verification Form */}
          {mode === 'verify' && (
            <form onSubmit={handleVerification} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Kode verifikasi telah dikirim ke WhatsApp Anda
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Kode Verifikasi (6 digit)
                </label>
                <input
                  type="text"
                  value={verificationData.code}
                  onChange={(e) => setVerificationData({ 
                    ...verificationData, 
                    code: e.target.value.replace(/\D/g, '').slice(0, 6)
                  })}
                  className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || verificationData.code.length !== 6}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-pink-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Memverifikasi...' : 'Verifikasi'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-pink-400 hover:text-pink-300 text-sm font-medium"
                >
                  Kembali ke pendaftaran
                </button>
              </div>
            </form>
          )}

          {/* Profile Completion Form */}
          {mode === 'complete' && (
            <form onSubmit={handleProfileCompletion} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👤</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Lengkapi profil Anda untuk menyelesaikan pendaftaran
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Nama lengkap Anda"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-pink-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Menyelesaikan...' : 'Selesaikan Pendaftaran'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
