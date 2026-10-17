import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getTypeStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-800 text-emerald-50 border-emerald-600';
      case 'error':
        return 'bg-rose-800 text-rose-50 border-rose-600';
      case 'info':
      default:
        return 'bg-slate-900 text-slate-100 border-slate-700';
    }
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-[calc(100vw-32px)] pointer-events-none" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto min-w-[280px] max-w-sm w-full px-4 py-3 rounded-xl border shadow-xl flex items-center justify-between gap-3 text-sm font-medium transition-all transform animate-fade-in ${getTypeStyles(
              toast.type
            )}`}
          >
            <span className="leading-snug">{toast.message}</span>
            <button
              type="button"
              className="text-white/70 hover:text-white text-lg leading-none cursor-pointer p-1"
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
