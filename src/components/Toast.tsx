/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X, Bell } from 'lucide-react';

type ToastItem = { id: string; message: string; type?: 'success'|'error'|'info'|'warning'|'new'|'paid'|'cancelled' };

type ToastCtx = {
  push: (message: string, type?: ToastItem['type']) => void;
  showToast: (message: string, type?: ToastItem['type']) => void;
};

const Ctx = createContext<ToastCtx>({ 
  push: () => {}, 
  showToast: () => {} 
});

export const useToast = () => useContext(Ctx);

// Get icon for toast type
const getToastIcon = (type: ToastItem['type']) => {
  switch (type) {
    case 'success':
    case 'paid':
      return CheckCircle;
    case 'error':
    case 'cancelled':
      return XCircle;
    case 'warning':
      return AlertTriangle;
    case 'new':
      return Bell;
    default:
      return Info;
  }
};

// Get toast styling
const getToastStyling = (type: ToastItem['type']) => {
  switch (type) {
    case 'success':
      return {
        background: 'bg-gradient-to-r from-emerald-500/20 to-green-500/20',
        border: 'border-emerald-400/60',
        text: 'text-emerald-100',
        shadow: 'shadow-lg shadow-emerald-500/20',
        icon: 'text-emerald-400'
      };
    case 'paid':
      return {
        background: 'bg-gradient-to-r from-green-500/20 to-emerald-600/20',
        border: 'border-green-400/60',
        text: 'text-green-100',
        shadow: 'shadow-lg shadow-green-500/20',
        icon: 'text-green-400'
      };
    case 'error':
      return {
        background: 'bg-gradient-to-r from-red-500/20 to-rose-500/20',
        border: 'border-red-400/60',
        text: 'text-red-100',
        shadow: 'shadow-lg shadow-red-500/20',
        icon: 'text-red-400'
      };
    case 'cancelled':
      return {
        background: 'bg-gradient-to-r from-red-500/20 to-pink-500/20',
        border: 'border-red-400/60',
        text: 'text-red-100',
        shadow: 'shadow-lg shadow-red-500/20',
        icon: 'text-red-400'
      };
    case 'warning':
      return {
        background: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20',
        border: 'border-amber-400/60',
        text: 'text-amber-100',
        shadow: 'shadow-lg shadow-amber-500/20',
        icon: 'text-amber-400'
      };
    case 'new':
      return {
        background: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20',
        border: 'border-blue-400/60',
        text: 'text-blue-100',
        shadow: 'shadow-lg shadow-blue-500/20',
        icon: 'text-blue-400'
      };
    default:
      return {
        background: 'bg-gradient-to-r from-white/15 to-gray-100/10',
        border: 'border-white/30',
        text: 'text-white',
        shadow: 'shadow-lg shadow-black/20',
        icon: 'text-white/80'
      };
  }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ToastItem[]>([]);
  
  const push = useCallback((message: string, type: ToastItem['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setItems((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 4000);
  }, []);
  
  const removeToast = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);
  
  const ctx = useMemo(() => ({ 
    push, 
    showToast: push // Alias for better API
  }), [push]);

  return (
    <Ctx.Provider value={ctx}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] space-y-3 max-w-sm">
        {items.map(toast => {
          const Icon = getToastIcon(toast.type);
          const styling = getToastStyling(toast.type);
          
          return (
            <div 
              key={toast.id} 
              className={`group relative px-4 py-3 rounded-xl backdrop-blur-md border transition-all duration-500 ease-out transform-gpu animate-in slide-in-from-right-full ${styling.background} ${styling.border} ${styling.text} ${styling.shadow} hover:scale-105 cursor-pointer`}
              onClick={() => removeToast(toast.id)}
            >
              <div className="flex items-start gap-3">
                <Icon size={18} className={`flex-shrink-0 mt-0.5 ${styling.icon}`} />
                <p className="text-sm font-medium leading-relaxed flex-1 pr-2">
                  {toast.message}
                </p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeToast(toast.id);
                  }}
                  className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-200"
                >
                  <X size={14} />
                </button>
              </div>
              
              {/* Progress bar */}
              <div className={`absolute bottom-0 left-0 h-1 ${styling.background} rounded-b-xl animate-[shrink_4s_linear_forwards]`}></div>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
};
