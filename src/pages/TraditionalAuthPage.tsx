import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/TraditionalAuthContext.tsx';
import { useToast } from '../components/Toast.tsx';
import PhoneInput from '../components/PhoneInput.tsx';
import PasswordInput from '../components/PasswordInput.tsx';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'verify' | 'complete'>('login');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, signup, verifyPhone, completeProfile } = useAuth();
  const { showToast } = useToast();

  // Login tab state
  const [loginTab, setLoginTab] = useState<'email' | 'phone'>('email');

  // Login form state
  const [loginData, setLoginData] = useState({
    identifier: '', // phone or email
    password: ''
  });

  // Email login state
  const [emailLoginData, setEmailLoginData] = useState({
    email: '',
    password: ''
  });

  // Phone login state
  const [phoneLoginData, setPhoneLoginData] = useState({
    phone: '',
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
    name: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use the appropriate identifier based on login tab
      const identifier = loginTab === 'email' ? emailLoginData.email : phoneLoginData.phone;
      const password = loginTab === 'email' ? emailLoginData.password : phoneLoginData.password;
      
      const result = await login(identifier, password);
      
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
      const decodedRedirect = redirect ? decodeURIComponent(redirect) : '/';
      navigate(decodedRedirect, { replace: true });
      
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
    
    if (profileData.password !== profileData.confirmPassword) {
      showToast('Password tidak cocok', 'error');
      return;
    }

    if (profileData.password.length < 6) {
      showToast('Password minimal 6 karakter', 'error');
      return;
    }

    setLoading(true);

    try {
      const result = await completeProfile(profileData.email, profileData.name, profileData.password);
      
      if (result.error) {
        showToast(result.error, 'error');
        return;
      }

      showToast('Profil berhasil dilengkapi! Selamat datang!', 'success');
      
      // Redirect to intended page or home
      const redirect = searchParams.get('redirect');
      const decodedRedirect = redirect ? decodeURIComponent(redirect) : '/';
      navigate(decodedRedirect, { replace: true });
      
    } catch (error) {
      showToast('Terjadi kesalahan. Silakan coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
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
              {mode === 'login' && 'Pilih metode masuk yang Anda inginkan'}
              {mode === 'signup' && 'Buat akun dengan nomor WhatsApp'}
              {mode === 'verify' && 'Masukkan kode yang dikirim ke WhatsApp'}
              {mode === 'complete' && 'Tambahkan email dan nama lengkap'}
            </p>
          </div>

          {/* Login Form */}
          {mode === 'login' && (
            <div className="space-y-6">
              {/* Login Tabs */}
              <div className="flex bg-gray-800/50 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setLoginTab('email')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    loginTab === 'email'
                      ? 'bg-pink-500 text-white shadow-md'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setLoginTab('phone')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    loginTab === 'phone'
                      ? 'bg-pink-500 text-white shadow-md'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  Nomor HP
                </button>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Login Tab */}
                {loginTab === 'email' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={emailLoginData.email}
                        onChange={(e) => setEmailLoginData({ ...emailLoginData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="email@example.com"
                        required
                      />
                    </div>

                    <div>
                    <PasswordInput
                      value={emailLoginData.password}
                      onChange={(value) => setEmailLoginData({ ...emailLoginData, password: value })}
                      placeholder="Masukkan password"
                      required
                    />
                    </div>
                  </>
                )}

                {/* Phone Login Tab */}
                {loginTab === 'phone' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nomor HP
                      </label>
                      <PhoneInput
                        value={phoneLoginData.phone}
                        onChange={(value) => setPhoneLoginData({ ...phoneLoginData, phone: value })}
                        placeholder="Masukkan Nomor WhatsApp"
                        required
                      />
                    </div>

                    <PasswordInput
                      value={phoneLoginData.password}
                      onChange={(value) => setPhoneLoginData({ ...phoneLoginData, password: value })}
                      placeholder="Masukkan password"
                      required
                    />
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-pink-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Masuk...' : `Masuk dengan ${loginTab === 'email' ? 'Email' : 'Nomor HP'}`}
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
            </div>
          )}

          {/* Signup Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nomor WhatsApp
                </label>
                <PhoneInput
                  value={signupData.phone}
                  onChange={(value) => setSignupData({ 
                    ...signupData, 
                    phone: value
                  })}
                  placeholder="Masukkan Nomor WhatsApp"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Verification code will be sent to this number (Supports Asian countries)
                </p>
              </div>

              <PasswordInput
                value={signupData.password}
                onChange={(value) => setSignupData({ ...signupData, password: value })}
                placeholder="Minimal 6 karakter"
                required
              />

              <PasswordInput
                value={signupData.confirmPassword}
                onChange={(value) => setSignupData({ ...signupData, confirmPassword: value })}
                placeholder="Ulangi password"
                label="Konfirmasi Password"
                required
              />

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
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
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
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
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

              <div>
                <PasswordInput
                  value={profileData.password}
                  onChange={(value) => setProfileData({ ...profileData, password: value })}
                  placeholder="Buat password (min. 6 karakter)"
                  required
                />
              </div>

              <div>
                <PasswordInput
                  value={profileData.confirmPassword}
                  onChange={(value) => setProfileData({ ...profileData, confirmPassword: value })}
                  placeholder="Konfirmasi password"
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
