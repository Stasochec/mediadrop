import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4">
      {toasts.map((toast) => {
        let borderClass = 'border-cyan-500/30 bg-surface-100/90 text-cyan-200';
        let Icon = Info;

        if (toast.type === 'success') {
          borderClass = 'border-emerald-500/30 bg-surface-100/90 text-emerald-200';
          Icon = CheckCircle2;
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-500/30 bg-surface-100/90 text-rose-200';
          Icon = AlertCircle;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl glass-panel border shadow-2xl backdrop-blur-xl animate-fadeIn ${borderClass}`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">
              {toast.text}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
