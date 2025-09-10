import React from 'react';

interface ConfirmationIconProps {
  isSuccess: boolean;
}

export const ConfirmationIcon: React.FC<ConfirmationIconProps> = ({ isSuccess }) => {
  if (isSuccess) {
    return (
      <div className="text-green-600">
        <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }

  return (
    <div className="text-red-600">
      <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  );
};
