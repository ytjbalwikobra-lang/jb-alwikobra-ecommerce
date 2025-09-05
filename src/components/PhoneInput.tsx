import React, { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = "Masukkan nomor WhatsApp",
  required = false,
  className = "",
  onValidationChange,
}) => {
  const [error, setError] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(true);

  // Extract the number part (remove +62 prefix if present)
  const getDisplayValue = (fullValue: string): string => {
    if (!fullValue) return '';
    
    // Remove all non-digits
    const digitsOnly = fullValue.replace(/\D/g, '');
    
    // If starts with 62, remove it to show only the local part
    if (digitsOnly.startsWith('62')) {
      return digitsOnly.substring(2);
    }
    
    // If starts with 0, remove it (Indonesian local format)
    if (digitsOnly.startsWith('0')) {
      return digitsOnly.substring(1);
    }
    
    return digitsOnly;
  };

  // Validate phone number format
  const validatePhoneNumber = (inputValue: string): { isValid: boolean; error: string } => {
    if (!inputValue) {
      if (required) {
        return { isValid: false, error: 'Nomor WhatsApp wajib diisi' };
      }
      return { isValid: true, error: '' };
    }

    // Remove all non-digits
    const digitsOnly = inputValue.replace(/\D/g, '');
    
    // Check if empty after removing non-digits
    if (!digitsOnly) {
      return { isValid: false, error: 'Nomor hanya boleh berisi angka' };
    }

    // Check if starts with valid Indonesian mobile prefix
    if (!digitsOnly.startsWith('8')) {
      return { isValid: false, error: 'Nomor harus dimulai dengan angka 8 (format: 8xxxxxxxxx)' };
    }
    
    // Check minimum length (Indonesian mobile numbers are at least 10 digits after country code)
    if (digitsOnly.length < 10) {
      return { isValid: false, error: 'Nomor terlalu pendek (minimal 10 digit)' };
    }

    // Check maximum length (Indonesian mobile numbers are typically 10-13 digits after country code)
    if (digitsOnly.length > 13) {
      return { isValid: false, error: 'Nomor terlalu panjang (maksimal 13 digit)' };
    }

    // Check for common invalid patterns
    if (digitsOnly === '8888888888' || digitsOnly === '8000000000' || digitsOnly === '8111111111') {
      return { isValid: false, error: 'Nomor tidak valid (gunakan nomor WhatsApp asli)' };
    }

    // Check if it's a valid Indonesian mobile number pattern
    const validPrefixes = ['81', '82', '83', '85', '87', '88', '89'];
    const firstTwoDigits = digitsOnly.substring(0, 2);
    if (!validPrefixes.includes(firstTwoDigits)) {
      return { isValid: false, error: 'Nomor bukan operator seluler Indonesia yang valid' };
    }

    return { isValid: true, error: '' };
  };

  // Format the input value to display
  const displayValue = getDisplayValue(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Remove all non-digits
    const digitsOnly = inputValue.replace(/\D/g, '');
    
    // Validate the input
    const validation = validatePhoneNumber(digitsOnly);
    setError(validation.error);
    setIsValid(validation.isValid);
    
    // Notify parent component about validation status
    if (onValidationChange) {
      onValidationChange(validation.isValid);
    }

    // Prevent invalid inputs from being processed
    if (digitsOnly && !digitsOnly.startsWith('8')) {
      setError('Nomor harus dimulai dengan angka 8');
      setIsValid(false);
      if (onValidationChange) {
        onValidationChange(false);
      }
      return;
    }
    
    // Prevent too long inputs
    if (digitsOnly.length > 13) {
      setError('Nomor terlalu panjang (maksimal 13 digit)');
      setIsValid(false);
      if (onValidationChange) {
        onValidationChange(false);
      }
      return;
    }
    
    // Format as +62 + number for storage
    const formattedValue = digitsOnly ? `+62${digitsOnly}` : '';
    
    onChange(formattedValue);
  };

  const handleBlur = () => {
    // Re-validate on blur to show final validation state
    const validation = validatePhoneNumber(displayValue);
    setError(validation.error);
    setIsValid(validation.isValid);
    
    if (onValidationChange) {
      onValidationChange(validation.isValid);
    }
  };

  const getBorderColor = () => {
    if (!displayValue) return 'border-pink-500/40';
    if (isValid) return 'border-green-500/60';
    return 'border-red-500/60';
  };

  const getIconColor = () => {
    if (!displayValue) return 'text-gray-400';
    if (isValid) return 'text-green-500';
    return 'text-red-500';
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
          +62
        </div>
        <input
          type="tel"
          required={required}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full pl-12 pr-10 py-2 border ${getBorderColor()} bg-black text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${className}`}
          placeholder={placeholder}
          maxLength={13}
        />
        {displayValue && (
          <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${getIconColor()}`}>
            {isValid ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="text-xs text-red-400 mt-1 flex items-center space-x-1">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}
      
      {/* Help text */}
      {!error && (
        <div className="text-xs text-gray-500 mt-1">
          Format: +62 8xxxxxxxxx (dimulai dengan angka 8, maksimal 13 digit)
        </div>
      )}
      
      {/* Valid confirmation */}
      {displayValue && isValid && !error && (
        <div className="text-xs text-green-400 mt-1 flex items-center space-x-1">
          <CheckCircle size={12} />
          <span>Nomor WhatsApp valid</span>
        </div>
      )}
    </div>
  );
};

export default PhoneInput;
