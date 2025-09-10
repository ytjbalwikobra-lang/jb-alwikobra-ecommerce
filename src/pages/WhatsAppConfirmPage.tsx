import React from 'react';
import { useWhatsAppConfirm } from '../hooks/useWhatsAppConfirm';
import { WhatsAppConfirmLoader } from '../components/whatsapp/WhatsAppConfirmLoader';
import { WhatsAppConfirmResult } from '../components/whatsapp/WhatsAppConfirmResult';

const WhatsAppConfirmPageRefactored: React.FC = () => {
  const { isLoading, message, isSuccess, navigateHome } = useWhatsAppConfirm();

  if (isLoading) {
    return <WhatsAppConfirmLoader />;
  }

  return (
    <WhatsAppConfirmResult
      isSuccess={isSuccess}
      message={message}
      onNavigateHome={navigateHome}
    />
  );
};

export default WhatsAppConfirmPageRefactored;
