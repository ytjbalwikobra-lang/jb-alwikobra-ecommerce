import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  label?: string;
  error?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder = "Masukkan password",
  className = "",
  required = false,
  label = "Password",
  error
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const defaultClassName = `w-full px-4 py-3 pr-12 bg-gradient-to-r from-white/10 to-white/5 border ${error ? 'border-red-400/60' : isFocused ? 'border-pink-500/60' : 'border-gray-600/50'} rounded-xl text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/60 focus:bg-white/15 hover:bg-white/12 ${error ? 'focus:ring-red-500/50' : ''}`;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-300 transition-colors duration-300">
          {label}
          {required && <span className="text-pink-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative group">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={className || defaultClassName}
          placeholder={placeholder}
          required={required}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
        
        {/* Focus ring */}
        <div className={`absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none ${isFocused ? 'ring-2 ring-pink-500/30 ring-offset-2 ring-offset-transparent' : ''}`}></div>
      </div>
      
      {/* Error message */}
      {error && (
        <p className="text-sm text-red-400 font-medium animate-in slide-in-from-top-1 duration-300">
          {error}
        </p>
      )}
    </div>
  );
};

export default PasswordInput;
