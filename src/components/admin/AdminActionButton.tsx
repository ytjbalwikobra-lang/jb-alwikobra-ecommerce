import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminActionButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const AdminActionButton: React.FC<AdminActionButtonProps> = ({
  icon: Icon,
  onClick,
  variant = 'secondary',
  size = 'md',
  tooltip,
  loading = false,
  disabled = false,
  className = ''
}) => {
  const variants = {
    primary: 'bg-orange-600 hover:bg-orange-700 text-white border-orange-600',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
    success: 'bg-green-600 hover:bg-green-700 text-white border-green-600',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600'
  };

  const sizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      title={tooltip}
      className={`
        inline-flex items-center justify-center rounded-lg border transition-all duration-200
        ${variants[variant]}
        ${sizes[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <Icon size={iconSizes[size]} className={loading ? 'animate-spin' : ''} />
    </button>
  );
};

export default AdminActionButton;
