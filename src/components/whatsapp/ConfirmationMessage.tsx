import React from 'react';

interface ConfirmationMessageProps {
  isSuccess: boolean;
  message: string;
}

export const ConfirmationMessage: React.FC<ConfirmationMessageProps> = ({ 
  isSuccess, 
  message 
}) => {
  return (
    <>
      <h2 className={`text-xl font-semibold mb-4 ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>
        {isSuccess ? 'Success!' : 'Error'}
      </h2>
      
      <p className="text-gray-600 mb-6">
        {message}
      </p>
    </>
  );
};
