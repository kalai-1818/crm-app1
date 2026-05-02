import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className={`
                min-w-[320px] max-w-[420px] p-4 rounded-2xl border flex items-start gap-4 shadow-2xl
                ${t.type === 'success' ? 'bg-white border-green-100 text-stone-900 shadow-green-900/5' : ''}
                ${t.type === 'error' ? 'bg-white border-red-100 text-stone-900 shadow-red-900/5' : ''}
                ${t.type === 'info' ? 'bg-white border-stone-200 text-stone-900 shadow-stone-900/5' : ''}
              `}>
                <div className={`mt-0.5 shrink-0`}>
                  {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                  {t.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black uppercase tracking-widest text-stone-400 mb-1">
                    {t.type === 'success' ? 'Success' : t.type === 'error' ? 'Error' : 'Notification'}
                  </p>
                  <p className="text-sm font-bold text-stone-900 leading-relaxed italic">{t.message}</p>
                </div>
                <button 
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 p-1 hover:bg-stone-50 rounded-lg text-stone-300 hover:text-stone-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}
