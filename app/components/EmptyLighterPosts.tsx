'use client';

import Link from 'next/link';
import { useCurrentLocale } from '@/locales/client';
import EmptyState from './EmptyState';

export default function EmptyLighterPosts({ lighterId }: { lighterId: string }) {
  const locale = useCurrentLocale();

  return (
    <EmptyState
      illustration="/illustrations/dreaming_hoping.png"
      title="The Story Begins..."
      description="This lighter's journey has just started. Be the first to add a chapter to its story and inspire others!"
      action={{
        label: 'Add the First Post',
        onClick: () => (window.location.href = `/${locale}/lighter/${lighterId}/add`),
      }}
    />
  );
}
