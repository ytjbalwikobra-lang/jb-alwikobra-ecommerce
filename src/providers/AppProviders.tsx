import React from 'react';
import { ToastProvider } from '../components/Toast';
import { ConfirmationProvider } from '../components/ConfirmationModal';
import { AuthProvider } from '../contexts/TraditionalAuthContext';
import { WishlistProvider } from '../contexts/WishlistContext';

interface Props {
  children: React.ReactNode;
}

const AppProviders: React.FC<Props> = ({ children }) => (
  <AuthProvider>
    <WishlistProvider>
      <ToastProvider>
        <ConfirmationProvider>{children}</ConfirmationProvider>
      </ToastProvider>
    </WishlistProvider>
  </AuthProvider>
);

export default AppProviders;
