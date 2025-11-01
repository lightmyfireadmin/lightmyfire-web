'use client';

import React from 'react';
import { ToastProvider } from '@/lib/context/ToastContext';
import ToastContainer from './Toast';

/**
 * Toast Wrapper Component
 * Provides Toast context and renders toast notifications
 * Should wrap the entire application
 */
export default function ToastWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastContainer />
    </ToastProvider>
  );
}
