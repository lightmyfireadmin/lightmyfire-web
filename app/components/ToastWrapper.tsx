'use client';

import React from 'react';
import { ToastProvider } from '@/lib/context/ToastContext';
import ToastContainer from './Toast';

export default function ToastWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastContainer />
    </ToastProvider>
  );
}
