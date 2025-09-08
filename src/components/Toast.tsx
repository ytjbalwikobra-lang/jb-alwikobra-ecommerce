import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

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

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((message: string, type: ToastItem['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setItems((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 3000);
  }, []);
  
  const ctx = useMemo(() => ({ 
    push, 
    showToast: push // Alias for better API
  }), [push]);

  return (
    <Ctx.Provider value={ctx}>
      {children}
      <div className="fixed bottom-4 right-4 z-[1000] space-y-2">
        {items.map(t => (
          <div key={t.id} className={
            `px-3 py-2 rounded shadow text-sm backdrop-blur border transition-all duration-300 ` +
            (t.type === 'success' || t.type === 'paid' ? 'bg-green-500/20 text-green-200 border-green-400/40' :
             t.type === 'error' || t.type === 'cancelled' ? 'bg-red-500/20 text-red-200 border-red-400/40' :
             t.type === 'warning' || t.type === 'new' ? 'bg-amber-500/20 text-amber-100 border-amber-400/40' :
             'bg-white/10 text-white border-white/20')
          }>
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
};
