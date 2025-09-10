import React from 'react';
import { Star } from 'lucide-react';

interface ProductDetailsProps {
  accountLevel?: string;
  accountDetails?: string;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  accountLevel,
  accountDetails
}) => {
  if (!accountLevel) return null;

  return (
    <div className="mb-6 p-4 bg-black border border-pink-500/30 rounded-xl">
      <h3 className="font-semibold text-white mb-2 flex items-center space-x-2">
        <Star className="text-yellow-400" size={16} />
        <span>Detail Akun</span>
      </h3>
      <p className="text-gray-300">
        <strong>Level:</strong> {accountLevel}
      </p>
      {accountDetails && (
        <p className="text-gray-300 mt-1">{accountDetails}</p>
      )}
    </div>
  );
};
