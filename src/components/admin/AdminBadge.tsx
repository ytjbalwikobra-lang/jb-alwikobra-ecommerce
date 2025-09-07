import React from 'react';

interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

interface AdminStatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  size?: 'sm' | 'md';
}

const AdminBadge: React.FC<AdminBadgeProps> = ({
  children,
  variant = 'secondary',
  size = 'sm',
  className = ''
}) => {
  const variants = {
    primary: 'bg-orange-100 text-orange-800 border-orange-200',
    secondary: 'bg-gray-100 text-gray-800 border-gray-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  return (
    <span className={`
      inline-flex items-center font-medium rounded-full border
      ${variants[variant]}
      ${sizes[size]}
      ${className}
    `}>
      {children}
    </span>
  );
};

const AdminStatusBadge: React.FC<AdminStatusBadgeProps> = ({ status, size = 'sm' }) => {
  const statusConfig = {
    active: { variant: 'success' as const, text: 'Active', dot: true },
    inactive: { variant: 'secondary' as const, text: 'Inactive', dot: true },
    pending: { variant: 'warning' as const, text: 'Pending', dot: true },
    approved: { variant: 'success' as const, text: 'Approved', dot: false },
    rejected: { variant: 'danger' as const, text: 'Rejected', dot: false },
    completed: { variant: 'success' as const, text: 'Completed', dot: false },
    cancelled: { variant: 'danger' as const, text: 'Cancelled', dot: false }
  };

  const config = statusConfig[status];

  return (
    <AdminBadge variant={config.variant} size={size}>
      {config.dot && (
        <span className={`
          w-1.5 h-1.5 rounded-full mr-1.5
          ${config.variant === 'success' ? 'bg-green-400' : ''}
          ${config.variant === 'warning' ? 'bg-yellow-400' : ''}
          ${config.variant === 'secondary' ? 'bg-gray-400' : ''}
        `}></span>
      )}
      {config.text}
    </AdminBadge>
  );
};

export { AdminBadge, AdminStatusBadge };
