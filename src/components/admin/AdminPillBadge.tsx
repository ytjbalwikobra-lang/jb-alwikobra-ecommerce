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
  variant = 'primary', 
  size = 'md', 
  className = '' 
}) => {
  const variants = {
    primary: 'text-orange-300 bg-orange-500/20 border-orange-400/40 shadow-orange-400/10',
    secondary: 'text-gray-300 bg-gray-500/20 border-gray-400/40 shadow-gray-400/10',
    success: 'text-green-300 bg-green-500/20 border-green-400/40 shadow-green-400/10',
    warning: 'text-yellow-300 bg-yellow-500/20 border-yellow-400/40 shadow-yellow-400/10',
    danger: 'text-red-300 bg-red-500/20 border-red-400/40 shadow-red-400/10',
    info: 'text-blue-300 bg-blue-500/20 border-blue-400/40 shadow-blue-400/10'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`
      inline-flex items-center rounded-full border 
      font-medium shadow-md backdrop-blur-sm
      ${variants[variant]} ${sizes[size]} ${className}
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
