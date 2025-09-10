import React from 'react';

interface TermsHeaderProps {
  lastUpdated: string;
}

export const TermsHeader: React.FC<TermsHeaderProps> = ({ lastUpdated }) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Syarat & Ketentuan
      </h1>
      <p className="text-gray-600">
        Terakhir diperbarui: {lastUpdated}
      </p>
    </div>
  );
};
