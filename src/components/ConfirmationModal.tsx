/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

interface ConfirmationOptions {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  showCancel?: boolean;
}

interface ConfirmationContextType {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
  showConfirmation: (options: ConfirmationOptions) => Promise<boolean>;
}

const ConfirmationContext = createContext<ConfirmationContextType>({
  confirm: async () => false,
  showConfirmation: async () => false,
});

export const useConfirmation = () => useContext(ConfirmationContext);

interface ConfirmationState extends ConfirmationOptions {
  isOpen: boolean;
  resolve: (value: boolean) => void;
}

export const ConfirmationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    message: '',
    resolve: () => {},
  });

  const confirm = useCallback((options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        ...options,
        isOpen: true,
        resolve,
      });
    });
  }, []);

  const handleConfirm = async () => {
    try {
      if (state.onConfirm) {
        await state.onConfirm();
      }
      state.resolve(true);
    } catch (error) {
      console.error('Confirmation action failed:', error);
      state.resolve(false);
    }
    setState(prev => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (state.onCancel) {
      state.onCancel();
    }
    state.resolve(false);
    setState(prev => ({ ...prev, isOpen: false }));
  };

  const getIcon = () => {
    switch (state.type) {
      case 'warning':
        return <AlertTriangle className="text-amber-400" size={28} />;
      case 'error':
        return <AlertCircle className="text-red-400" size={28} />;
      case 'success':
        return <CheckCircle className="text-emerald-400" size={28} />;
      default:
        return <Info className="text-blue-400" size={28} />;
    }
  };

  const getButtonColor = () => {
    switch (state.type) {
      case 'warning':
        return 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-lg shadow-amber-500/30';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg shadow-red-500/30';
      case 'success':
        return 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg shadow-emerald-500/30';
      default:
        return 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg shadow-pink-500/30';
    }
  };

  const getBorderColor = () => {
    switch (state.type) {
      case 'warning':
        return 'border-amber-500/30';
      case 'error':
        return 'border-red-500/30';
      case 'success':
        return 'border-emerald-500/30';
      default:
        return 'border-blue-500/30';
    }
  };

  return (
    <ConfirmationContext.Provider value={{ confirm, showConfirmation: confirm }}>
      {children}
      
      {/* Modal */}
      {state.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={handleCancel}
          />
          
          {/* Modal Content */}
          <div className={`relative bg-gradient-to-br from-gray-900/95 to-black/95 border ${getBorderColor()} rounded-2xl shadow-2xl shadow-black/50 max-w-md w-full mx-4 overflow-hidden backdrop-blur-md animate-in zoom-in-90 slide-in-from-bottom-4 duration-300`}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
                  {getIcon()}
                </div>
                <h3 className="text-xl font-bold text-white">
                  {state.title}
                </h3>
              </div>
              
              {state.showCancel !== false && (
                <button
                  onClick={handleCancel}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            
            {/* Body */}
            <div className="p-6">
              <p className="text-gray-300 leading-relaxed text-base">
                {state.message}
              </p>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700/50 bg-gradient-to-r from-gray-800/30 to-gray-900/30">
              {state.showCancel !== false && (
                <button
                  onClick={handleCancel}
                  className="px-5 py-2.5 text-gray-300 hover:text-white bg-gradient-to-r from-gray-700/50 to-gray-600/50 hover:from-gray-600/50 hover:to-gray-500/50 rounded-xl transition-all duration-200 font-medium border border-gray-600/30 hover:border-gray-500/50"
                >
                  {state.cancelText || 'Batal'}
                </button>
              )}
              
              <button
                onClick={handleConfirm}
                className={`px-6 py-2.5 text-white rounded-xl transition-all duration-200 font-semibold transform hover:scale-105 active:scale-95 ${getButtonColor()}`}
              >
                {state.confirmText || 'Konfirmasi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmationContext.Provider>
  );
};
