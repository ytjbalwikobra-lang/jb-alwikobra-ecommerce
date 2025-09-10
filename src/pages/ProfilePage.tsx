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
        <div className="min-h-screen bg-app-dark">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <ProfileHeader 
              profile={profile}
              onLogout={handleLogout}
            />
            
            <div className="bg-black rounded-xl border border-pink-500/40 p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-6">Informasi Profil</h2>
              
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
