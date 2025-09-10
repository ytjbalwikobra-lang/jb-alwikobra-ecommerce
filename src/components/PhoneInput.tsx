/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-return, prefer-const, react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { COUNTRIES, type Country } from '../utils/countryData';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  defaultCountry?: string;
  disableAutoDetect?: boolean; // New prop to disable auto region detection
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
  onValidationChange,
  defaultCountry = 'ID',
  disableAutoDetect = true // Default to true - disable auto detect by default
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES.find(c => c.code === defaultCountry) || COUNTRIES[0]
  );
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCountries, setFilteredCountries] = useState(COUNTRIES);
  const [error, setError] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(true);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-detect country based on phone number input
  const detectCountryFromNumber = (number: string): Country | null => {
    const cleanNumber = number.replace(/\D/g, '');
    
    // PRIORITY 1: Check for full country code prefixes first (most reliable)
    for (const country of COUNTRIES) {
      const countryDigits = country.phoneCode.slice(1); // Remove +
      if (cleanNumber.startsWith(countryDigits)) {
        return country;
      }
    }
    
    // PRIORITY 2: Indonesia detection (08xxx or 8xxx patterns)
    if (/^(08|8)/.test(cleanNumber) && cleanNumber.length >= 10) {
      return COUNTRIES.find(c => c.code === 'ID') || null;
    }
    
    // PRIORITY 3: Malaysia detection (01xxx or 1xxx patterns)
    if (/^(01|1)/.test(cleanNumber) && cleanNumber.length >= 9) {
      return COUNTRIES.find(c => c.code === 'MY') || null;
    }
    
    // PRIORITY 4: Singapore detection ([689]xxx patterns) - only if exactly 8 digits
    if (/^[689]/.test(cleanNumber) && cleanNumber.length === 8 && !cleanNumber.startsWith('62')) {
      return COUNTRIES.find(c => c.code === 'SG') || null;
    }
    
    return null;
  };

  // Validate phone number based on selected country
  const validatePhoneNumber = (number: string, country: Country): { isValid: boolean; error: string } => {
    if (!number) {
      if (required) {
        return { isValid: false, error: 'Nomor telepon wajib diisi' };
      }
      return { isValid: true, error: '' };
    }

    const cleanNumber = number.replace(/\D/g, '');
    
    if (!cleanNumber) {
      return { isValid: false, error: 'Nomor hanya boleh berisi angka' };
    }

    // Remove leading 0 for certain countries
    let localNumber = cleanNumber;
    if ((country.code === 'ID' || country.code === 'MY') && localNumber.startsWith('0')) {
      localNumber = localNumber.slice(1);
    }

    // Remove country code if present
    const countryDigits = country.phoneCode.slice(1);
    if (localNumber.startsWith(countryDigits)) {
      localNumber = localNumber.slice(countryDigits.length);
    }

    // Check pattern
    if (country.pattern && !country.pattern.test(localNumber)) {
      return { 
        isValid: false, 
        error: `Format tidak valid untuk ${country.name}. Contoh: ${country.phoneCode} ${country.placeholder}` 
      };
    }

    // Check valid prefixes for the country
    if (country.validPrefixes) {
      const prefix = localNumber.slice(0, 2);
      const singlePrefix = localNumber.slice(0, 1);
      const hasValidPrefix = country.validPrefixes.some(p => 
        prefix.startsWith(p) || singlePrefix === p
      );
      
      if (!hasValidPrefix) {
        return { 
          isValid: false, 
          error: `Nomor tidak valid untuk operator ${country.name}` 
        };
      }
    }

    // Check length constraints
    if (country.maxLength && localNumber.length > country.maxLength) {
      return { 
        isValid: false, 
        error: `Nomor terlalu panjang (maksimal ${country.maxLength} digit)` 
      };
    }

    if (localNumber.length < 8) {
      return { isValid: false, error: 'Nomor terlalu pendek' };
    }

    return { isValid: true, error: '' };
  };

  // Format phone number for display
  const formatPhoneNumber = (number: string, country: Country): string => {
    const cleanNumber = number.replace(/\D/g, '');
    
    // Remove country code and leading zeros
    let localNumber = cleanNumber;
    const countryDigits = country.phoneCode.slice(1);
    
    if (localNumber.startsWith(countryDigits)) {
      localNumber = localNumber.slice(countryDigits.length);
    }
    
    if ((country.code === 'ID' || country.code === 'MY') && localNumber.startsWith('0')) {
      localNumber = localNumber.slice(1);
    }

    // Apply country-specific formatting
    if (country.code === 'ID') {
      return localNumber.replace(/(\d{3})(\d{4})?(\d{4})?/, (match, p1, p2, p3) => {
        let result = p1;
        if (p2) result += '-' + p2;
        if (p3) result += '-' + p3;
        return result;
      });
    }
    
    if (country.code === 'MY') {
      return localNumber.replace(/(\d{2})(\d{3})?(\d{4})?/, (match, p1, p2, p3) => {
        let result = p1;
        if (p2) result += '-' + p2;
        if (p3) result += '-' + p3;
        return result;
      });
    }
    
    return localNumber;
  };

  // Handle phone number input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    // Do not auto-detect country; keep manual selection only
    const currentCountry = selectedCountry;
    
    // Validate and format
    const validation = validatePhoneNumber(inputValue, currentCountry);
    setError(validation.error);
    setIsValid(validation.isValid);
    
    // Format for display
    const formattedNumber = formatPhoneNumber(inputValue, currentCountry);
    setPhoneNumber(formattedNumber);
    
    // Generate full international number for parent
    const cleanNumber = inputValue.replace(/\D/g, '');
    let localNumber = cleanNumber;
    
    // Remove country code if present
    const countryDigits = currentCountry.phoneCode.slice(1);
    if (localNumber.startsWith(countryDigits)) {
      localNumber = localNumber.slice(countryDigits.length);
    }
    
    // Remove leading 0 for certain countries
    if ((currentCountry.code === 'ID' || currentCountry.code === 'MY') && localNumber.startsWith('0')) {
      localNumber = localNumber.slice(1);
    }
    
    const fullNumber = localNumber ? `${currentCountry.phoneCode}${localNumber}` : '';
    onChange(fullNumber);
    
    if (onValidationChange) {
      onValidationChange(validation.isValid);
    }
  };

  // Handle country selection
  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowDropdown(false);
    setSearchTerm('');
    
    // Revalidate with new country
    if (phoneNumber) {
      const validation = validatePhoneNumber(phoneNumber, country);
      setError(validation.error);
      setIsValid(validation.isValid);
      
      if (onValidationChange) {
        onValidationChange(validation.isValid);
      }
    }
    
    inputRef.current?.focus();
  };

  // Filter countries based on search
  useEffect(() => {
    const filtered = COUNTRIES.filter(country =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.phoneCode.includes(searchTerm) ||
      country.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCountries(filtered);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Parse initial value (no auto-detect; keep manual country selection)
  useEffect(() => {
    if (value) {
      // Format for display using current selected country
      const formatted = formatPhoneNumber(value, selectedCountry);
      setPhoneNumber(formatted);
      
      // Validate
      const validation = validatePhoneNumber(value, selectedCountry);
      setError(validation.error);
      setIsValid(validation.isValid);
      onValidationChange?.(validation.isValid);
    }
  }, [value, selectedCountry, onValidationChange]);

  const getBorderColor = () => {
    if (!phoneNumber) return 'border-pink-500/40';
    if (isValid) return 'border-green-500/60';
    return 'border-red-500/60';
  };

  const getIconColor = () => {
    if (!phoneNumber) return 'text-gray-400';
    if (isValid) return 'text-green-500';
    return 'text-red-500';
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`flex rounded-lg border ${getBorderColor()} bg-black text-white overflow-hidden`}>
        
        {/* Country Selector */}
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-3 py-2 border-r border-pink-500/40 hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <span className="text-lg">{selectedCountry.flag}</span>
          <span className="text-sm font-medium text-gray-300">{selectedCountry.phoneCode}</span>
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {/* Phone Number Input */}
        <input
          ref={inputRef}
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={placeholder || selectedCountry.placeholder}
          required={required}
          maxLength={Math.max(selectedCountry.maxLength || 15, 15)}
          className="flex-1 px-3 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 text-white placeholder-gray-400"
        />

        {/* Validation Icon */}
        {phoneNumber && (
          <div className={`flex items-center px-3 ${getIconColor()}`}>
            {isValid ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          </div>
        )}
      </div>

      {/* Country Dropdown */}
      {showDropdown && (
        <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-600">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>

          {/* Countries List */}
          <div className="overflow-y-auto max-h-48">
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                onClick={() => handleCountrySelect(country)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-700 transition-colors ${
                  selectedCountry.code === country.code ? 'bg-pink-600/20 text-pink-300' : 'text-gray-300'
                }`}
              >
                <span className="text-lg">{country.flag}</span>
                <span className="font-medium">{country.phoneCode}</span>
                <span className="flex-1 truncate">{country.name}</span>
              </button>
            ))}
            
            {filteredCountries.length === 0 && (
              <div className="px-3 py-4 text-center text-gray-500 text-sm">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}

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
          Format: {selectedCountry.phoneCode} {selectedCountry.placeholder}
        </div>
      )}
      
      {/* Valid confirmation */}
      {phoneNumber && isValid && !error && (
        <div className="text-xs text-green-400 mt-1 flex items-center space-x-1">
          <CheckCircle size={12} />
          <span>Nomor telepon valid</span>
        </div>
      )}
    </div>
  );
};

export default PhoneInput;
