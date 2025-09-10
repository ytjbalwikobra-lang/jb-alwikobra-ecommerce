/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/TraditionalAuthContext';
import { useToast } from '../components/Toast';

export type AuthMode = 'login' | 'signup' | 'verify' | 'complete';
export type LoginTab = 'email' | 'phone';

export interface LoginData {
  identifier: string;
  password: string;
}

export interface EmailLoginData {
  email: string;
  password: string;
}

export interface PhoneLoginData {
  phone: string;
  password: string;
}

export interface SignupData {
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface VerificationData {
  userId: string;
  code: string;
}

export interface ProfileData {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export interface UseTraditionalAuthReturn {
  // State
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  loading: boolean;
  loginTab: LoginTab;
  setLoginTab: (tab: LoginTab) => void;
  
  // Form data
  loginData: LoginData;
  setLoginData: (data: LoginData) => void;
  emailLoginData: EmailLoginData;
  setEmailLoginData: (data: EmailLoginData) => void;
  phoneLoginData: PhoneLoginData;
  setPhoneLoginData: (data: PhoneLoginData) => void;
  signupData: SignupData;
  setSignupData: (data: SignupData) => void;
  verificationData: VerificationData;
  setVerificationData: (data: VerificationData) => void;
  profileData: ProfileData;
  setProfileData: (data: ProfileData) => void;
  
  // Handlers
  handleLogin: (e: React.FormEvent) => Promise<void>;
  handleSignup: (e: React.FormEvent) => Promise<void>;
  handleVerify: (e: React.FormEvent) => Promise<void>;
  handleCompleteProfile: (e: React.FormEvent) => Promise<void>;
  
  // Validation
  validateSignup: () => boolean;
  validateProfile: () => boolean;
}

export const useTraditionalAuth = (): UseTraditionalAuthReturn => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, signup, verifyPhone, completeProfile } = useAuth();
  const { showToast } = useToast();

  // Login tab state
  const [loginTab, setLoginTab] = useState<LoginTab>('email');

  // Form states
  const [loginData, setLoginData] = useState<LoginData>({
    identifier: '',
    password: ''
  });

  const [emailLoginData, setEmailLoginData] = useState<EmailLoginData>({
    email: '',
    password: ''
  });

  const [phoneLoginData, setPhoneLoginData] = useState<PhoneLoginData>({
    phone: '',
    password: ''
  });

  const [signupData, setSignupData] = useState<SignupData>({
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [verificationData, setVerificationData] = useState<VerificationData>({
    userId: '',
    code: ''
  });

  const [profileData, setProfileData] = useState<ProfileData>({
    email: '',
    name: '',
    password: '',
    confirmPassword: ''
  });

  const validateSignup = useCallback((): boolean => {
    if (!signupData.phone || signupData.phone.length < 10) {
      showToast('Nomor WhatsApp harus diisi dengan benar', 'error');
      return false;
    }

    if (!signupData.password || signupData.password.length < 6) {
      showToast('Password minimal 6 karakter', 'error');
      return false;
    }

    if (signupData.password !== signupData.confirmPassword) {
      showToast('Password konfirmasi tidak cocok', 'error');
      return false;
    }

    return true;
  }, [signupData, showToast]);

  const validateProfile = useCallback((): boolean => {
    if (!profileData.email || !profileData.name) {
      showToast('Email dan nama harus diisi', 'error');
      return false;
    }

    if (profileData.password && profileData.password !== profileData.confirmPassword) {
      showToast('Password konfirmasi tidak cocok', 'error');
      return false;
    }

    return true;
  }, [profileData, showToast]);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const identifier = loginTab === 'email' ? emailLoginData.email : phoneLoginData.phone;
      const password = loginTab === 'email' ? emailLoginData.password : phoneLoginData.password;
      
      const result = await login(identifier, password);
      
      if (result.error) {
        showToast(result.error, 'error');
        return;
      }

      showToast('Login berhasil!', 'success');
      
      if (!result.profileCompleted) {
        setMode('complete');
        return;
      }

      const redirect = searchParams.get('redirect');
      const decodedRedirect = redirect ? decodeURIComponent(redirect) : '/';
      navigate(decodedRedirect, { replace: true });
      
    } catch (error) {
      showToast('Terjadi kesalahan. Silakan coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  }, [loginTab, emailLoginData, phoneLoginData, login, showToast, searchParams, navigate]);

  const handleSignup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignup()) {
      return;
    }

    setLoading(true);

    try {
      const result = await signup(signupData.phone, signupData.password);
      
      if (result.error) {
        showToast(result.error, 'error');
        return;
      }

      if (result.userId) {
        setVerificationData(prev => ({ ...prev, userId: result.userId }));
        setMode('verify');
        showToast('Kode verifikasi telah dikirim ke WhatsApp Anda', 'success');
      }
      
    } catch (error) {
      showToast('Terjadi kesalahan. Silakan coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  }, [signupData, validateSignup, signup, showToast]);

  const handleVerify = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationData.code || verificationData.code.length !== 6) {
      showToast('Kode verifikasi harus 6 digit', 'error');
      return;
    }

    setLoading(true);

    try {
      const result = await verifyPhone(verificationData.userId, verificationData.code);
      
      if (result.error) {
        showToast(result.error, 'error');
        return;
      }

      setMode('complete');
      showToast('Verifikasi berhasil! Lengkapi profil Anda', 'success');
      
    } catch (error) {
      showToast('Terjadi kesalahan. Silakan coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  }, [verificationData, verifyPhone, showToast]);

  const handleCompleteProfile = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfile()) {
      return;
    }

    setLoading(true);

    try {
      const result = await completeProfile(
        profileData.email,
        profileData.name,
        profileData.password || ''
      );
      
      if (result.error) {
        showToast(result.error, 'error');
        return;
      }

      showToast('Profil berhasil dilengkapi!', 'success');
      
      const redirect = searchParams.get('redirect');
      const decodedRedirect = redirect ? decodeURIComponent(redirect) : '/';
      navigate(decodedRedirect, { replace: true });
      
    } catch (error) {
      showToast('Terjadi kesalahan. Silakan coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  }, [profileData, validateProfile, completeProfile, showToast, searchParams, navigate]);

  return {
    // State
    mode,
    setMode,
    loading,
    loginTab,
    setLoginTab,
    
    // Form data
    loginData,
    setLoginData,
    emailLoginData,
    setEmailLoginData,
    phoneLoginData,
    setPhoneLoginData,
    signupData,
    setSignupData,
    verificationData,
    setVerificationData,
    profileData,
    setProfileData,
    
    // Handlers
    handleLogin,
    handleSignup,
    handleVerify,
    handleCompleteProfile,
    
    // Validation
    validateSignup,
    validateProfile
  };
};
