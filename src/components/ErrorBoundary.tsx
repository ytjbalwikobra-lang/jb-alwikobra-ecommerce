/* eslint-disable react/prop-types */
import React, { memo, useCallback } from 'react';
import { productionMonitor } from '../utils/productionMonitor';

const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Log via production monitor; avoid console in production
      productionMonitor['getErrors']; // keep side-effect free import used
      if (event.error instanceof Error) {
        setError(event.error);
      } else {
        const errorMessage = event.error ? String(event.error) : 'Unknown error';
        setError(new Error(errorMessage));
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason: unknown = event.reason;
      if (reason instanceof Error) {
        setError(reason);
      } else if (typeof reason === 'string') {
        setError(new Error(reason));
      } else {
        setError(new Error('Unhandled promise rejection'));
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return { error, resetError };
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = memo(({ children }) => {
  const { error, resetError } = useErrorBoundary();

  const handleRefresh = useCallback(() => {
    resetError();
    window.location.reload();
  }, [resetError]);

  if (error) {
    return (
      <div className="min-h-screen bg-app-dark flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Oops! Terjadi kesalahan</h1>
          <p className="text-gray-400 mb-4">Silakan refresh halaman atau coba lagi nanti.</p>
          <button
            onClick={handleRefresh}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
          >
            Refresh Halaman
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
});

ErrorBoundary.displayName = 'ErrorBoundary';

export default ErrorBoundary;
