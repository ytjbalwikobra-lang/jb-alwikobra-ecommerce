import React from 'react';

interface AdminPillBadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  className?: string;
}

const AdminPillBadge: React.FC<AdminPillBadgeProps> = ({
  children,
  variant = 'secondary',
  size = 'sm',
  glow = true,
  className = ''
}) => {
  const variants = {
    primary: {
      bg: 'bg-orange-500/20',
      border: 'border-orange-400/40',
      text: 'text-orange-200',
      glow: 'shadow-orange-400/25'
    },
    secondary: {
      bg: 'bg-gray-500/20',
      border: 'border-gray-400/40',
      text: 'text-gray-200',
      glow: 'shadow-gray-400/25'
    },
    success: {
      bg: 'bg-green-500/20',
      border: 'border-green-400/40',
      text: 'text-green-200',
      glow: 'shadow-green-400/25'
    },
    warning: {
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-400/40',
      text: 'text-yellow-200',
      glow: 'shadow-yellow-400/25'
    },
    danger: {
      bg: 'bg-red-500/20',
      border: 'border-red-400/40',
      text: 'text-red-200',
      glow: 'shadow-red-400/25'
    },
    info: {
      bg: 'bg-blue-500/20',
      border: 'border-blue-400/40',
      text: 'text-blue-200',
      glow: 'shadow-blue-400/25'
    }
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const variantStyles = variants[variant];

  return (
    <span className={`
      inline-flex items-center font-medium rounded-full border backdrop-blur-sm
      ${variantStyles.bg}
      ${variantStyles.border}
      ${variantStyles.text}
      ${sizes[size]}
      ${glow ? `shadow-lg ${variantStyles.glow}` : ''}
      transition-all duration-200 hover:scale-105
      ${className}
    `}>
      {children}
    </span>
  );
};

interface AdminPillStatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled' | 'draft';
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

const AdminPillStatusBadge: React.FC<AdminPillStatusBadgeProps> = ({ 
  status, 
  size = 'sm', 
  showDot = true 
}) => {
  const statusConfig = {
    active: { variant: 'success' as const, text: 'Active', dot: 'bg-green-400' },
    inactive: { variant: 'secondary' as const, text: 'Inactive', dot: 'bg-gray-400' },
    pending: { variant: 'warning' as const, text: 'Pending', dot: 'bg-yellow-400' },
    approved: { variant: 'success' as const, text: 'Approved', dot: 'bg-green-400' },
    rejected: { variant: 'danger' as const, text: 'Rejected', dot: 'bg-red-400' },
    completed: { variant: 'success' as const, text: 'Completed', dot: 'bg-green-400' },
    cancelled: { variant: 'danger' as const, text: 'Cancelled', dot: 'bg-red-400' },
    draft: { variant: 'info' as const, text: 'Draft', dot: 'bg-blue-400' }
  };

  const config = statusConfig[status];

  return (
    <AdminPillBadge variant={config.variant} size={size}>
      {showDot && (
        <span className={`
          w-1.5 h-1.5 rounded-full mr-2 animate-pulse
          ${config.dot}
        `}></span>
      )}
      {config.text}
    </AdminPillBadge>
  );
};

export { AdminPillBadge, AdminPillStatusBadge };
