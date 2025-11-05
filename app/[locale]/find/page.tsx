import { Suspense } from 'react';
import PinEntryForm from '@/app/components/PinEntryForm';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function FindPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <PinEntryForm />
      </Suspense>
    </div>
  );
}