import React from 'react';

interface AdminCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  headerActions?: React.ReactNode;
}

const AdminCard: React.FC<AdminCardProps> = ({
  children,
  title,
  subtitle,
  className = '',
  headerActions
}) => {
  return (
    <div className={`bg-gray-900/60 border border-orange-500/30 rounded-xl p-6 ${className}`}>
      {(title || subtitle || headerActions) && (
        <div className="flex items-center justify-between mb-6">
          <div>
            {title && <h2 className="text-xl font-bold text-white mb-1">{title}</h2>}
            {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
          </div>
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default AdminCard;
