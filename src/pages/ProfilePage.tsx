import React from 'react';
import { useProfilePage } from '../hooks/useProfilePage';
import { ProfileHeader, ProfileForm, ProfileActions } from '../components/profile';
import { ProfileFormData } from '../components/profile/ProfileForm';
import ErrorBoundary from '../components/ErrorBoundary';
import { AuthRequired } from '../components/ProtectedRoute';

/**
 * Refactored ProfilePage component following best practices:
 * - Separated business logic into custom hook (useProfilePage)
 * - Modularized UI into reusable components
 * - Improved error handling and loading states
 * - Better TypeScript typing
 * - Removed ESLint suppressions
 * - Clean separation of concerns
 */
const ProfilePage: React.FC = () => {
  const {
    profile,
    saveLoading,
    isEditing,
    hasChanges,
    isValidPhone,
    setIsValidPhone,
    handleSaveProfile,
    handleLogout,
    handleCancelEdit,
    handleProfileChange,
    handleNotificationChange
  } = useProfilePage();

  // Adapter function to handle form field changes
  const handleFormChange = (field: keyof ProfileFormData, value: string) => {
    // Map ProfileFormData fields to ProfileData fields
    if (field === 'whatsapp') {
      handleProfileChange('phone', value);
    } else {
      // Type-safe mapping for known fields
      const fieldMap: Record<string, keyof typeof profile> = {
        name: 'name',
        email: 'email',
        phone: 'phone',
        dateOfBirth: 'dateOfBirth',
        gender: 'gender',
        bio: 'bio'
      };
      
      const mappedField = fieldMap[field];
      if (mappedField) {
        handleProfileChange(mappedField, value);
      }
    }
  };

  // Create form data with whatsapp field mapped to phone
  const formData: ProfileFormData = {
    ...profile,
    whatsapp: profile.phone
  };

  return (
    <AuthRequired>
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
          
          <div className="relative max-w-4xl mx-auto px-4 py-8 space-y-8">
            <ProfileHeader 
              profile={profile}
              onLogout={handleLogout}
            />
            
            {/* Enhanced profile form card */}
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 rounded-2xl border border-pink-500/30 p-6 md:p-8 shadow-2xl shadow-black/20 backdrop-blur-sm">
              {/* Header with gradient */}
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-pink-500/30">
                  <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Informasi Profil
                  </h2>
                  <p className="text-gray-400 text-sm">Kelola informasi akun dan preferensi Anda</p>
                </div>
              </div>
              
              <ProfileForm
                profile={formData}
                onProfileChange={handleFormChange}
                onNotificationChange={handleNotificationChange}
                isEditing={isEditing}
                isValidPhone={isValidPhone}
                onPhoneValidationChange={setIsValidPhone}
              />
            </div>
            
            <ProfileActions
              isEditing={isEditing}
              hasChanges={hasChanges}
              saveLoading={saveLoading}
              isValidPhone={isValidPhone}
              onSave={handleSaveProfile}
              onCancel={handleCancelEdit}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </ErrorBoundary>
    </AuthRequired>
  );
};

export default ProfilePage;
