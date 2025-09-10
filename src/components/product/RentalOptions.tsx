import React from 'react';
import { Calendar } from 'lucide-react';
import { RentalOption } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface RentalOptionsProps {
  rentalOptions: RentalOption[];
  selectedRental: RentalOption | null;
  onRentalSelect: (rental: RentalOption) => void;
  cameFromFlashSaleCard: boolean;
  hasRental: boolean;
}

export const RentalOptions: React.FC<RentalOptionsProps> = ({
  rentalOptions,
  selectedRental,
  onRentalSelect,
  cameFromFlashSaleCard,
  hasRental
}) => {
  // Hidden if user came from flash sale card
  if (cameFromFlashSaleCard || !hasRental || !rentalOptions?.length) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="font-semibold text-white mb-3 flex items-center space-x-2">
        <Calendar className="text-pink-400" size={16} />
        <span>Opsi Rental</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rentalOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onRentalSelect(option)}
            className={`p-3 border-2 rounded-lg text-left transition-colors ${
              selectedRental?.id === option.id
                ? 'border-pink-500 bg-pink-500/10'
                : 'border-pink-500/30 hover:bg-white/5'
            }`}
          >
            <div className="font-medium text-white">{option.duration}</div>
            <div className="text-pink-400 font-semibold">
              {formatCurrency(option.price)}
            </div>
            {option.description && (
              <div className="text-sm text-gray-300 mt-1">{option.description}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
