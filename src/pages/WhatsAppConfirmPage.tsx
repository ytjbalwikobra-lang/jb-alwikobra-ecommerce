import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/TraditionalAuthContext';
import { useToast } from '../components/Toast';

const WhatsAppConfirmPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

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
      handleWhatsAppVerification(token);
    } else {
      handleGeneralConfirmation(token);
    }
  }, [searchParams]);

  const handleWhatsAppVerification = async (token: string) => {
    try {
      // In a real implementation, you would verify the token with your backend
      // For now, we'll simulate a successful verification
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
  };

  const handleGeneralConfirmation = async (token: string) => {
    try {
      // Handle other types of confirmations
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
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Processing Confirmation
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your request...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          {isSuccess ? (
            <div className="text-green-600">
              <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="text-red-600">
              <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
          
          <h2 className={`text-xl font-semibold mb-4 ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>
            {isSuccess ? 'Success!' : 'Error'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConfirmPage;
