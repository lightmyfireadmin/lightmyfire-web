import LoginClient from './LoginClient';
import { Suspense } from 'react';

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
