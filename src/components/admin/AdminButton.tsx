import React from 'react';

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const AdminButton: React.FC<AdminButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const variants = {
    primary: 'bg-orange-600 hover:bg-orange-700 text-white border-orange-600',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
    success: 'bg-green-600 hover:bg-green-700 text-white border-green-600',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600',
    ghost: 'bg-transparent hover:bg-gray-700 text-gray-300 border-gray-600'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center gap-2 font-medium rounded-lg border transition-all duration-200
        ${variants[variant]}
        ${sizes[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && icon && icon}
      {children}
    </button>
  );
};

export { AdminButton };
export default AdminButton;
