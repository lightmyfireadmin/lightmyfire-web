'use client';

import { useEffect } from 'react';

/**
 * Global error boundary that catches errors in the root layout
 * This is a fallback for errors that escape the regular error.tsx boundary
 * Must be a client component and include <html> and <body> tags
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console
    console.error('Global error boundary caught:', error);
    console.error('Error stack:', error.stack);

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          digest: error.digest,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          source: 'global-error-boundary',
        }),
      }).catch((err) => {
        console.error('Failed to log global error:', err);
      });
    }
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{
            maxWidth: '28rem',
            padding: '2rem',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            textAlign: 'center',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}>
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: '#dc2626',
            }}>
              Application Error
            </h1>
            <p style={{
              marginBottom: '1.5rem',
              color: '#374151',
            }}>
              A critical error occurred. Please try refreshing the page.
            </p>
            <p style={{
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
              color: '#6b7280',
            }}>
              Error ID: {error.digest || 'unknown'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => reset()}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                Try Again
              </button>
              <a
                href="/"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  textDecoration: 'none',
                  display: 'block',
                }}
              >
                Go Home
              </a>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                <summary style={{
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: '#374151',
                }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{
                  marginTop: '0.5rem',
                  overflow: 'auto',
                  padding: '1rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  color: '#374151',
                }}>
                  {error.message}
                  {'\n\n'}
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
