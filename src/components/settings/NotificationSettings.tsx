import React from 'react';
import { Bell } from 'lucide-react';
import { ToggleSwitch } from './ToggleSwitch';

interface NotificationSettingsProps {
  notifications: {
    email: boolean;
    whatsapp: boolean;
    push: boolean;
  };
  onNotificationChange: (key: 'email' | 'whatsapp' | 'push', value: boolean) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  notifications,
  onNotificationChange
}) => {
  return (
    <div className="bg-black/40 backdrop-blur rounded-xl p-6 border border-pink-500/30">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Bell size={20} className="mr-2" />
        Notifikasi
      </h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white">Email</div>
            <div className="text-gray-400 text-sm">Notifikasi pesanan dan promo via email</div>
          </div>
          <ToggleSwitch
            checked={notifications.email}
            onChange={(value) => onNotificationChange('email', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-white">WhatsApp</div>
            <div className="text-gray-400 text-sm">Konfirmasi pesanan via WhatsApp</div>
          </div>
          <ToggleSwitch
            checked={notifications.whatsapp}
            onChange={(value) => onNotificationChange('whatsapp', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-white">Push Notification</div>
            <div className="text-gray-400 text-sm">Notifikasi browser (coming soon)</div>
          </div>
          <ToggleSwitch
            checked={notifications.push}
            onChange={(value) => onNotificationChange('push', value)}
            disabled
          />
        </div>
      </div>
    </div>
  );
};
