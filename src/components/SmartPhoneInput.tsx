/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useCallback } from 'react';
import { normalizeAsianPhone, formatDisplayPhone, isPhoneNumber, getSupportedCountries } from '../utils/phoneUtils';

interface SmartPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  showCountrySelector?: boolean;
}

const SmartPhoneInput: React.FC<SmartPhoneInputProps> = ({
  value,
  onChange,
  placeholder = "Enter phone number",
  className = "",
  disabled = false,
  required = false,
  showCountrySelector = true
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState<string>('');

  // Handle input changes with real-time formatting
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    // Normalize the phone number
    const result = normalizeAsianPhone(inputValue);
    
    // Update detected country
    if (result.isValid) {
      setDetectedCountry(result.country);
      onChange(result.normalized);
    } else {
      setDetectedCountry('');
      // For invalid or partial input, pass the raw value
      onChange(inputValue);
    }
  }, [onChange]);

  // Handle focus - show raw input for editing
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setDisplayValue(value);
  }, [value]);

  // Handle blur - show formatted version if valid
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    
    if (isPhoneNumber(value)) {
      const result = normalizeAsianPhone(value);
      if (result.isValid) {
        setDisplayValue(result.displayFormat);
        setDetectedCountry(result.country);
      }
    }
  }, [value]);

  // Update display value when prop value changes
  React.useEffect(() => {
    if (!isFocused && value) {
      if (isPhoneNumber(value)) {
        const result = normalizeAsianPhone(value);
        if (result.isValid) {
          setDisplayValue(result.displayFormat);
          setDetectedCountry(result.country);
        } else {
          setDisplayValue(value);
          setDetectedCountry('');
        }
      } else {
        setDisplayValue(value);
        setDetectedCountry('');
      }
    }
  }, [value, isFocused]);

  // Get validation status
  const getValidationStatus = () => {
    if (!value) return 'neutral';
    
    if (isPhoneNumber(value)) {
      const result = normalizeAsianPhone(value);
      return result.isValid ? 'valid' : 'invalid';
    }
    
    return 'neutral';
  };

  const validationStatus = getValidationStatus();

  const getBorderColor = () => {
    switch (validationStatus) {
      case 'valid': return 'border-green-500/60 shadow-green-500/25';
      case 'invalid': return 'border-red-500/60 shadow-red-500/25';
      default: return 'border-pink-500/40 hover:border-pink-500/60';
    }
  };

  const getIconColor = () => {
    switch (validationStatus) {
      case 'valid': return 'text-green-400';
      case 'invalid': return 'text-red-400';
      default: return 'text-pink-300';
    }
  };

  // Get country flag
  const getCountryFlag = () => {
    if (!detectedCountry) return '🌏';
    
    const countries = getSupportedCountries();
    const country = countries.find(c => c.name === detectedCountry);
    return country?.flag || '🌏';
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Phone Icon */}
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
        <svg
          className={`w-5 h-5 ${getIconColor()} transition-colors duration-200`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      </div>

      {/* Input Field */}
      <input
        type="tel"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full pl-12 ${showCountrySelector && detectedCountry ? 'pr-20' : 'pr-12'} py-3.5 rounded-xl border ${getBorderColor()} bg-gradient-to-r from-gray-900 to-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/80 transition-all duration-300 shadow-lg backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed`}
      />

      {/* Country Flag & Validation Icons */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2.5 z-10">
        {/* Country Flag */}
        {showCountrySelector && detectedCountry && (
          <span className="text-xl animate-fadeIn" title={detectedCountry}>
            {getCountryFlag()}
          </span>
        )}
        
        {/* Validation Icon */}
        {validationStatus === 'valid' && (
          <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center animate-fadeIn">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {validationStatus === 'invalid' && value && (
          <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center animate-fadeIn">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
      </div>

      {/* Helper Text */}
      {isFocused && !value && (
        <div className="absolute top-full left-0 mt-2 text-xs text-gray-400 animate-fadeIn bg-gray-800/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-700/50">
          Mendukung: Indonesia, Malaysia, Singapura, Thailand, Filipina, Vietnam, China, Jepang, Korea, India, dll.
        </div>
      )}
      
      {isFocused && validationStatus === 'invalid' && value && (
        <div className="absolute top-full left-0 mt-2 text-xs text-red-400 animate-fadeIn bg-red-900/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-red-500/30">
          Gunakan format lokal (08xxx) atau internasional (+62xxx, +65xxx, dll.)
        </div>
      )}
      
      {!isFocused && validationStatus === 'valid' && value && detectedCountry && (
        <div className="absolute top-full left-0 mt-2 text-xs text-green-400 animate-fadeIn bg-green-900/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-green-500/30">
          <span className="flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Nomor {detectedCountry} valid
          </span>
        </div>
      )}
    </div>
  );
};

export default SmartPhoneInput;
