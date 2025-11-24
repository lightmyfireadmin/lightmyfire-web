'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Root-level error component for handling unhandled exceptions in the application.
 *
 * This component is automatically rendered by Next.js when a server or client component throws an error.
 * It provides a user-friendly UI and attempts to log the error for diagnostic purposes.
 *
 * @param {object} props - The component props.
 * @param {Error & { digest?: string }} props.error - The error object caught by the boundary. `digest` is a hash of the error for matching.
 * @param {() => void} props.reset - A function provided by Next.js to attempt to re-render the segment and recover from the error.
 * @returns {JSX.Element} The rendered error UI.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('Error boundary caught:', error);
      console.error('Error stack:', error.stack);
    }

    // In production, attempt to send the error to the backend logging service
    if (process.env.NODE_ENV === 'production') {
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
        // Prevent cascading failures by logging tracking errors locally
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

        {/* Show detailed error information only in development mode */}
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
