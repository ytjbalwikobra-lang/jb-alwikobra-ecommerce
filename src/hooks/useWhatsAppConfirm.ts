import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/TraditionalAuthContext';
import { useToast } from '../components/Toast';

export interface UseWhatsAppConfirmReturn {
  isLoading: boolean;
  message: string;
  isSuccess: boolean;
  navigateHome: () => void;
}

export const useWhatsAppConfirm = (): UseWhatsAppConfirmReturn => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleWhatsAppVerification = useCallback(async (token: string) => {
    try {
      // In a real implementation, you would verify the token with your backend
      // For now, we'll simulate a successful verification using the token
      console.log('Verifying WhatsApp with token:', token);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage('WhatsApp number successfully verified!');
      setIsSuccess(true);
      showToast('WhatsApp number successfully verified!', 'success');
      
      // Redirect to appropriate page after verification
      setTimeout(() => {
        if (user) {
          navigate('/profile');
        } else {
          navigate('/auth');
        }
      }, 3000);
    } catch (error) {
      setMessage('Failed to verify WhatsApp number. Please try again.');
      setIsSuccess(false);
      showToast('Failed to verify WhatsApp number. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [user, navigate, showToast]);

  const handleGeneralConfirmation = useCallback(async (token: string) => {
    try {
      // Handle other types of confirmations using the token
      console.log('General confirmation with token:', token);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage('Confirmation successful!');
      setIsSuccess(true);
      showToast('Confirmation successful!', 'success');
      
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      setMessage('Confirmation failed. Please try again.');
      setIsSuccess(false);
      showToast('Confirmation failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, showToast]);

  useEffect(() => {
    const token = searchParams.get('token');
    const type = searchParams.get('type');

    if (!token) {
      setMessage('Invalid confirmation link');
      setIsLoading(false);
      return;
    }

    // Handle different types of confirmations
    if (type === 'whatsapp_verification') {
      void handleWhatsAppVerification(token);
    } else {
      void handleGeneralConfirmation(token);
    }
  }, [searchParams, handleWhatsAppVerification, handleGeneralConfirmation]);

  const navigateHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return {
    isLoading,
    message,
    isSuccess,
    navigateHome
  };
};
