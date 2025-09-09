import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { AdminButton } from './AdminButton';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Admin Error Boundary caught an error:', error, errorInfo);
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // You could also log to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
              <p className="text-gray-400 mb-6">
                We encountered an unexpected error. This has been logged and we're looking into it.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <AdminButton
                variant="primary"
                onClick={this.handleReset}
                icon={<RefreshCw className="h-4 w-4" />}
                className="w-full"
              >
                Try Again
              </AdminButton>
              
              <AdminButton
                variant="secondary"
                onClick={() => window.location.href = '/admin'}
                icon={<Home className="h-4 w-4" />}
                className="w-full"
              >
                Go to Dashboard
              </AdminButton>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-gray-800 rounded-lg p-4 mt-4">
                <summary className="text-sm font-medium text-gray-300 cursor-pointer mb-2">
                  Error Details (Development Only)
                </summary>
                <div className="text-xs text-red-400 font-mono space-y-2">
                  <div>
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  <div>
                    <strong>Stack:</strong>
                    <pre className="mt-1 whitespace-pre-wrap text-xs">
                      {this.state.error.stack}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, context?: string) => {
    console.error(`Error in ${context || 'component'}:`, error);
    
    // You could integrate with a toast system here
    // showErrorToast(error.message);
    
    // Or with an error reporting service
    // reportError(error, { context });
  }, []);

  return handleError;
};

// Simple error fallback components
export const AdminErrorFallback: React.FC<{ 
  error?: Error; 
  resetError?: () => void;
  title?: string;
  message?: string;
}> = ({ 
  error, 
  resetError, 
  title = "Something went wrong",
  message = "We encountered an unexpected error." 
}) => (
  <div className="bg-gray-900/60 border border-red-500/30 rounded-xl p-6 text-center">
    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
      <AlertTriangle className="h-6 w-6 text-red-500" />
    </div>
    <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
    <p className="text-gray-400 mb-4">{message}</p>
    
    {resetError && (
      <AdminButton
        variant="primary"
        size="sm"
        onClick={resetError}
        icon={<RefreshCw className="h-4 w-4" />}
      >
        Try Again
      </AdminButton>
    )}
    
    {process.env.NODE_ENV === 'development' && error && (
      <details className="mt-4 text-left">
        <summary className="text-sm text-gray-400 cursor-pointer">
          Error Details
        </summary>
        <pre className="mt-2 text-xs text-red-400 bg-gray-800 p-2 rounded overflow-auto">
          {error.stack}
        </pre>
      </details>
    )}
  </div>
);

// Network error fallback
export const NetworkErrorFallback: React.FC<{ 
  onRetry?: () => void;
  message?: string;
}> = ({ 
  onRetry, 
  message = "Unable to connect to the server. Please check your internet connection." 
}) => (
  <div className="bg-gray-900/60 border border-yellow-500/30 rounded-xl p-6 text-center">
    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
      <AlertTriangle className="h-6 w-6 text-yellow-500" />
    </div>
    <h3 className="text-lg font-medium text-white mb-2">Connection Error</h3>
    <p className="text-gray-400 mb-4">{message}</p>
    
    {onRetry && (
      <AdminButton
        variant="primary"
        size="sm"
        onClick={onRetry}
        icon={<RefreshCw className="h-4 w-4" />}
      >
        Retry
      </AdminButton>
    )}
  </div>
);

export default AdminErrorBoundary;
