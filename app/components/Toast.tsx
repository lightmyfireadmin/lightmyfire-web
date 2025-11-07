'use client';

import React, { useEffect } from 'react';
import { Toast as ToastType, useToast } from '@/lib/context/ToastContext';

interface ToastProps extends ToastType {
  onClose: (id: string) => void;
}

function Toast({ id, type, title, message, duration, onClose }: ToastProps) {
  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const typeStyles = {
    success: 'bg-green-500/90 text-white',
    error: 'bg-red-500/90 text-white',
    info: 'bg-blue-500/90 text-white',
    warning: 'bg-amber-500/90 text-white',
  };

  const typeIcons = {
    success: '✓',
    error: '✕',
    info: 'ⓘ',
    warning: '⚠',
  };

  return (
    <div
      className={`${typeStyles[type]} rounded-lg shadow-lg p-4 flex items-start gap-3 backdrop-blur-sm border border-white/20 animate-slide-in`}
      role="alert"
      aria-live="polite"
    >
      <span className="flex-shrink-0 text-xl font-bold">{typeIcons[type]}</span>
      <div className="flex-1 min-w-0">
        {title && <h3 className="font-semibold text-sm">{title}</h3>}
        <p className="text-sm opacity-95 break-words">{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
        aria-label="Close notification"
      >
        <span className="text-lg leading-none">×</span>
      </button>
    </div>
  );
}

const MemoizedToast = React.memo(Toast);

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-md pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <MemoizedToast {...toast} onClose={removeToast} />
        </div>
      ))}
    </div>
  );
}
