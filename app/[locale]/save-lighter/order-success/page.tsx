import { Suspense } from 'react';
import OrderSuccessContent from './OrderSuccessContent';

export const dynamic = 'force-dynamic';

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
