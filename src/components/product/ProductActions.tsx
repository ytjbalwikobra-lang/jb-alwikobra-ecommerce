import React from 'react';
import { CreditCard, Calendar } from 'lucide-react';
import { RentalOption } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface ProductActionsProps {
  stock: number;
  hasRental: boolean;
  selectedRental: RentalOption | null;
  cameFromFlashSaleCard: boolean;
  onPurchase: () => void;
  onRental: (rental: RentalOption) => void;
}

export const ProductActions: React.FC<ProductActionsProps> = ({
  stock,
  hasRental,
  selectedRental,
  cameFromFlashSaleCard,
  onPurchase,
  onRental
}) => {
  return (
    <div className="space-y-3 mb-6">
      {/* Purchase Button */}
      <button
        onClick={onPurchase}
        disabled={stock === 0}
        className={`w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-xl font-semibold transition-colors ${
          stock === 0
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-pink-600 text-white hover:bg-pink-700'
        }`}
      >
        <CreditCard size={20} />
        <span>
          {stock === 0 ? 'Stok Habis' : 'Beli Sekarang'}
        </span>
      </button>

      {/* Rental Button - hidden if user came from flash sale card */}
      {!cameFromFlashSaleCard && hasRental && selectedRental && (
        <button
          onClick={() => onRental(selectedRental)}
          disabled={stock === 0}
          className={`w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-xl font-semibold border-2 transition-colors ${
            stock === 0
              ? 'border-gray-700 text-gray-400 cursor-not-allowed'
              : 'border-pink-600 text-pink-400 hover:bg-white/5'
          }`}
        >
          <Calendar size={20} />
          <span>
            Rental {selectedRental.duration} - {formatCurrency(selectedRental.price)}
          </span>
        </button>
      )}
    </div>
  );
};
