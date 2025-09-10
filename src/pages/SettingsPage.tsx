import React from 'react';
import Footer from '../components/Footer';
import { AuthRequired } from '../components/ProtectedRoute';
import { useSettingsPage } from '../hooks/useSettingsPage';
import { SettingsHeader } from '../components/settings/SettingsHeader';
import { AppearanceSettings } from '../components/settings/AppearanceSettings';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { PrivacySettings } from '../components/settings/PrivacySettings';
import { SaveButton } from '../components/settings/SaveButton';
import { AppInfo } from '../components/settings/AppInfo';

const SettingsPageRefactored: React.FC = () => {
  const {
    settings,
    updateTheme,
    updateLanguage,
    updateNotification,
    updatePrivacy,
    saveSettings
  } = useSettingsPage();

  return (
    <AuthRequired>
      <div 
        className="min-h-screen" 
        style={{
          background: '#000000',
          backgroundImage: 'linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #1a1a1a 50%, #0a0a0a 75%, #000000 100%)'
        }}
      >
        <div className="pt-20 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <SettingsHeader />
            
            <div className="space-y-6">
              <AppearanceSettings
                theme={settings.theme}
                language={settings.language}
                onThemeChange={updateTheme}
                onLanguageChange={updateLanguage}
              />
              
              <NotificationSettings
                notifications={settings.notifications}
                onNotificationChange={updateNotification}
              />
              
              <PrivacySettings
                privacy={settings.privacy}
                onPrivacyChange={updatePrivacy}
              />
              
              <SaveButton onSave={saveSettings} />
              
              <AppInfo />
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </AuthRequired>
  );
};

export default SettingsPageRefactored;
