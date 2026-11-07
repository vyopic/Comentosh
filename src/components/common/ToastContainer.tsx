import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
          alert: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
          info: <Info className="w-4 h-4 text-[#2F80ED] shrink-0" />,
        };

        const borders = {
          success: 'border-emerald-200 bg-white',
          alert: 'border-rose-200 bg-white',
          info: 'border-slate-200 bg-white',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-lg ${
              borders[toast.type || 'info']
            } animate-in fade-in slide-in-from-bottom-2 duration-200`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {icons[toast.type || 'info']}
              <span className="text-xs font-medium text-slate-800 truncate">
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
