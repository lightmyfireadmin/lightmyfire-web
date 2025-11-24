import LoginClient from './LoginClient';
import { Suspense } from 'react';

/**
 * The Login page.
 *
 * This server component acts as a shell for the `LoginClient` component,
 * wrapping it in a `Suspense` boundary to handle loading states gracefully.
 *
 * @returns {JSX.Element} The rendered login page.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <LoginClient />
    </Suspense>
  );
}
