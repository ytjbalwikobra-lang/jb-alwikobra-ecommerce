import { useState, useCallback } from 'react';

interface ErrorInfo {
  message: string;
  stack?: string;
  code?: string;
}

interface UseErrorHandlerResult {
  error: ErrorInfo | null;
  hasError: boolean;
  clearError: () => void;
  handleError: (error: Error | string, context?: string) => void;
  withErrorHandling: <T extends any[], R>(
    fn: (...args: T) => Promise<R> | R
  ) => (...args: T) => Promise<R | void>;
}

export const useErrorHandler = (): UseErrorHandlerResult => {
  const [error, setError] = useState<ErrorInfo | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: Error | string, context?: string) => {
    const errorInfo: ErrorInfo = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      code: typeof error === 'object' && 'code' in error ? String(error.code) : undefined
    };

    console.error(`Error in ${context || 'component'}:`, error);
    setError(errorInfo);

    // You could integrate with an error reporting service here
    // reportError(error, { context });
  }, []);

  const withErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R> | R
  ) => {
    return async (...args: T): Promise<R | void> => {
      try {
        clearError();
        return await fn(...args);
      } catch (error) {
        handleError(error as Error);
      }
    };
  }, [clearError, handleError]);

  return {
    error,
    hasError: error !== null,
    clearError,
    handleError,
    withErrorHandling
  };
};

export const useAsyncError = () => {
  const [, setError] = useState();
  return useCallback(
    (e: Error) => {
      setError(() => {
        throw e;
      });
    },
    [setError]
  );
};
