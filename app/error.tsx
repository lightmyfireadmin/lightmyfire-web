'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error boundary caught:', error);
      console.error('Error stack:', error.stack);
    }

    // In production, you could send this to an error tracking service
    // Example: Sentry, LogRocket, or custom error logging endpoint
    if (process.env.NODE_ENV === 'production') {
      // Log to server-side error tracking
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          digest: error.digest,
          stack: error.stack,
          timestamp: new Date().toISOString(),
        }),
      }).catch((err) => {
        // Fail silently to not disrupt user experience
        console.error('Failed to log error:', err);
      });
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-background p-8 text-center shadow-lg">
        <h1 className="mb-4 text-3xl font-bold text-error">
          Oops! Something went wrong
        </h1>
        <p className="mb-6 text-foreground">
          An unexpected error occurred. Our team has been notified.
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          Error ID: {error.digest || 'unknown'}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="btn-primary w-full"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="btn-secondary w-full"
          >
            Go Home
          </Link>
        </div>

        {}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer font-semibold text-foreground">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-muted p-4 text-xs text-foreground">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
