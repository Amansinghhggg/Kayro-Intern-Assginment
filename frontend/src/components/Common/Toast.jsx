import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-start gap-3 transition-all animate-in slide-in-from-bottom-5 duration-200 ${
              isSuccess
                ? 'bg-emerald-900 text-white border-emerald-700'
                : isError
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-stone-900 text-white border-stone-700'
            }`}
          >
            {isSuccess && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {isInfo && <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">
              {toast.message}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-stone-300 hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
