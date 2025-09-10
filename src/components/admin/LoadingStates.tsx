/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'white' | 'orange' | 'gray';
  className?: string;
}

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'dots';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

interface SkeletonProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'orange',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const colorClasses = {
    white: 'text-white',
    orange: 'text-orange-500',
    gray: 'text-gray-400'
  };

  return (
    <svg 
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

export const LoadingDots: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center space-x-1 ${className}`}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"
        style={{ animationDelay: `${i * 0.2}s` }}
      />
    ))}
  </div>
);

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  lines = 3, 
  avatar = false 
}) => (
  <div className={`animate-pulse ${className}`}>
    {avatar && (
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-gray-700 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-700 rounded w-1/2" />
          <div className="h-3 bg-gray-700 rounded w-1/3" />
        </div>
      </div>
    )}
    <div className="space-y-3">
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-700 rounded ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  </div>
);

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'spinner',
  size = 'md',
  message,
  className = ''
}) => {
  if (type === 'skeleton') {
    return <Skeleton className={className} />;
  }

  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      {type === 'dots' ? (
        <LoadingDots className="mb-4" />
      ) : (
        <LoadingSpinner size={size} className="mb-4" />
      )}
      {message && (
        <p className="text-sm text-gray-400 text-center">{message}</p>
      )}
    </div>
  );
};

// Page-level loading component
export const AdminPageLoading: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="lg" className="mb-4 mx-auto" />
      <h3 className="text-lg font-medium text-white mb-2">Loading</h3>
      <p className="text-gray-400">{message}</p>
    </div>
  </div>
);

// Form loading overlay
export const FormLoadingOverlay: React.FC<{ 
  visible: boolean; 
  message?: string 
}> = ({ visible, message = 'Saving...' }) => {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 bg-gray-900/75 flex items-center justify-center z-50 rounded-lg">
      <div className="text-center">
        <LoadingSpinner size="md" className="mb-3 mx-auto" />
        <p className="text-sm text-white">{message}</p>
      </div>
    </div>
  );
};

// Button loading state
export const ButtonLoadingIcon: React.FC = () => (
  <LoadingSpinner size="sm" color="white" className="mr-2" />
);

export default LoadingState;
