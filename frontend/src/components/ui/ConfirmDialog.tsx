import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[2.5rem] border border-stone-200 shadow-2xl shadow-stone-900/20 max-w-md w-full overflow-hidden"
            >
              <div className="p-10 text-center">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                   {isDestructive ? <AlertTriangle className="w-8 h-8" /> : <X className="w-8 h-8" />}
                </div>
                <h3 className="text-2xl font-black tracking-tight text-stone-900 mb-2">{title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed font-medium italic">"{message}"</p>
              </div>

              <div className="p-8 bg-stone-50 border-t border-stone-100 flex gap-4">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 transition-colors"
                >
                  {cancelLabel}
                </button>
                <button 
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    isDestructive ? 'bg-red-600 shadow-red-900/10 hover:bg-red-700' : 'bg-stone-900 shadow-stone-900/10 hover:bg-stone-800'
                  }`}
                >
                  {confirmLabel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
