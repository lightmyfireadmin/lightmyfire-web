'use client';

import React from 'react';
import Link from 'next/link';
import { useCurrentLocale, useI18n } from '@/locales/client';
import EmptyState from './EmptyState';

function EmptyLighterPosts({ lighterId }: { lighterId: string }) {
  const locale = useCurrentLocale();
  const t = useI18n() as any;

  return (
    <EmptyState
      illustration="/illustrations/dreaming_hoping.png"
      title={t('empty_lighter.title')}
      description={t('empty_lighter.description')}
      action={{
        label: t('empty_lighter.action'),
        onClick: () => (window.location.href = `/${locale}/lighter/${lighterId}/add`),
      }}
    />
  );
}

export default React.memo(EmptyLighterPosts);
