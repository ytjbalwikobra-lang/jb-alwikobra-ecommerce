import React from 'react';
import { Link } from 'react-router-dom';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const colorClasses = {
    primary: 'border-pink-500',
    white: 'border-white',
    gray: 'border-gray-400'
  };

  return (
    <div 
      className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Memuat...',
  fullScreen = false,
  className = ''
}) => {
  const containerClass = fullScreen 
    ? 'min-h-screen flex items-center justify-center'
    : 'flex items-center justify-center py-16';

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="text-center">
        <LoadingSpinner size="lg" color="primary" className="mx-auto" />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  fullScreen?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Terjadi Kesalahan',
  message,
  onRetry,
  retryLabel = 'Coba Lagi',
  fullScreen = false,
  className = ''
}) => {
  const containerClass = fullScreen 
    ? 'min-h-screen flex items-center justify-center'
    : 'flex items-center justify-center py-16';

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-red-400 text-2xl">⚠️</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-4 max-w-md">{message}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
          >
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  );
};

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Tidak Ada Data',
  message,
  icon = '📦',
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-16 ${className}`}>
      <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
        <span className="text-gray-400 text-2xl">{icon}</span>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-4 max-w-md mx-auto">{message}</p>
      {action && (
        <button 
          onClick={action.onClick}
          className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

interface NotFoundProps {
  title?: string;
  message: string;
  linkTo?: string;
  linkText?: string;
  className?: string;
}

export const NotFound: React.FC<NotFoundProps> = ({
  title = 'Tidak Ditemukan',
  message,
  linkTo,
  linkText,
  className = ''
}) => {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-app-dark text-gray-200 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-300 mb-4">{message}</p>
        {linkTo && linkText && (
          <Link
            to={linkTo}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
          >
            {linkText}
          </Link>
        )}
      </div>
    </div>
  );
};
