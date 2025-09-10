import React from 'react';

interface OrderErrorProps {
  error: string;
  onRetry?: () => void;
}

export const OrderError: React.FC<OrderErrorProps> = ({ error, onRetry }) => {
  return (
    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
      <div className="text-red-400 mb-2">{error}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-pink-400 hover:text-pink-300 text-sm underline"
        >
          Coba lagi
        </button>
      )}
    </div>
  );
};
