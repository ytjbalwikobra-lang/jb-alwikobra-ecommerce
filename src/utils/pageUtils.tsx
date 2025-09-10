/**
 * Common page layout patterns and utilities
 */
import React from 'react';
import { LoadingState, ErrorState } from '../components/ui/LoadingStates';
import ErrorBoundary from '../components/ErrorBoundary';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

/**
 * Standard page layout with error boundary and loading states
 */
export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  description,
  loading = false,
  error = null,
  onRetry,
  className = ''
}) => {
  if (loading) {
    return <LoadingState fullScreen message="Memuat halaman..." />;
  }

  if (error) {
    return (
      <ErrorState
        fullScreen
        message={error}
        onRetry={onRetry || (() => window.location.reload())}
      />
    );
  }

  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-app-dark ${className}`}>
        {title && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
              {description && (
                <p className="text-gray-300">{description}</p>
              )}
            </div>
          </div>
        )}
        {children}
      </div>
    </ErrorBoundary>
  );
};

/**
 * Content container with standard spacing
 */
export const PageContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
    {children}
  </div>
);

/**
 * Standard page header component
 */
export const PageHeader: React.FC<{
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, description, action, className = '' }) => (
  <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 ${className}`}>
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
      {description && (
        <p className="text-gray-300">{description}</p>
      )}
    </div>
    {action && (
      <div className="flex-shrink-0">
        {action}
      </div>
    )}
  </div>
);

/**
 * Standard section container
 */
export const PageSection: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <section className={`py-8 ${className}`}>
    {children}
  </section>
);

/**
 * Hook for common page state management
 */
export const usePageState = (initialLoading = true) => {
  const [loading, setLoading] = React.useState(initialLoading);
  const [error, setError] = React.useState<string | null>(null);

  const setLoadingState = React.useCallback((isLoading: boolean) => {
    setLoading(isLoading);
    if (isLoading) {
      setError(null); // Clear error when starting to load
    }
  }, []);

  const setErrorState = React.useCallback((errorMessage: string | null) => {
    setError(errorMessage);
    setLoading(false); // Stop loading when error occurs
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const resetState = React.useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    setLoading: setLoadingState,
    setError: setErrorState,
    clearError,
    resetState
  };
};
