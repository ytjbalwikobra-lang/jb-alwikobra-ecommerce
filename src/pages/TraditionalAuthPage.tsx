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
    <div className="min-h-screen bg-app-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthHeader mode={mode} />
        <div className="bg-black/20 backdrop-blur-sm border border-pink-500/30 rounded-xl p-8 shadow-2xl">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default TraditionalAuthPage;
