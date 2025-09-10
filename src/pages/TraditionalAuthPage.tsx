import React from 'react';
import { useTraditionalAuth } from '../hooks/useTraditionalAuth';
import {
  AuthHeader,
  LoginTabs,
  LoginForm,
  SignupForm,
  VerificationForm,
  ProfileCompletionForm
} from '../components/auth';

const TraditionalAuthPage: React.FC = () => {
  const {
    // State
    mode,
    setMode,
    loading,
    loginTab,
    setLoginTab,
    
    // Form data
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
    handleCompleteProfile
  } = useTraditionalAuth();

  const renderContent = () => {
    switch (mode) {
      case 'login':
        return (
          <>
            <LoginTabs activeTab={loginTab} onTabChange={setLoginTab} />
            <LoginForm
              activeTab={loginTab}
              emailData={emailLoginData}
              phoneData={phoneLoginData}
              loading={loading}
              onEmailChange={setEmailLoginData}
              onPhoneChange={setPhoneLoginData}
              onSubmit={handleLogin}
              onModeChange={setMode}
            />
          </>
        );

      case 'signup':
        return (
          <SignupForm
            data={signupData}
            loading={loading}
            onChange={setSignupData}
            onSubmit={handleSignup}
            onModeChange={setMode}
          />
        );

      case 'verify':
        return (
          <VerificationForm
            data={verificationData}
            loading={loading}
            onChange={setVerificationData}
            onSubmit={handleVerify}
            onBack={() => setMode('signup')}
          />
        );

      case 'complete':
        return (
          <ProfileCompletionForm
            data={profileData}
            loading={loading}
            onChange={setProfileData}
            onSubmit={handleCompleteProfile}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative w-full max-w-md">
        <AuthHeader mode={mode} />
        
        {/* Enhanced auth card */}
        <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-md border border-pink-500/30 rounded-2xl p-8 shadow-2xl shadow-pink-500/10 animate-in slide-in-from-bottom-4 duration-500">
          {/* Decorative elements */}
          <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent"></div>
          <div className="absolute -bottom-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          
          {renderContent()}
        </div>
        
        {/* Trust indicators */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-400 text-sm">🔒 Dilindungi dengan enkripsi end-to-end</p>
          <div className="flex justify-center items-center space-x-4 text-xs text-gray-500">
            <span>✨ Trusted by 10k+ gamers</span>
            <span>•</span>
            <span>🚀 Fast & Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraditionalAuthPage;
