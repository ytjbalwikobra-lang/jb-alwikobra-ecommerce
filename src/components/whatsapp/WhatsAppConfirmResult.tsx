import React from 'react';
import { ConfirmationIcon } from './ConfirmationIcon';
import { ConfirmationMessage } from './ConfirmationMessage';
import { HomeButton } from './HomeButton';

interface WhatsAppConfirmResultProps {
  isSuccess: boolean;
  message: string;
  onNavigateHome: () => void;
}

export const WhatsAppConfirmResult: React.FC<WhatsAppConfirmResultProps> = ({
  isSuccess,
  message,
  onNavigateHome
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <ConfirmationIcon isSuccess={isSuccess} />
          <ConfirmationMessage isSuccess={isSuccess} message={message} />
          <HomeButton onNavigateHome={onNavigateHome} />
        </div>
      </div>
    </div>
  );
};
