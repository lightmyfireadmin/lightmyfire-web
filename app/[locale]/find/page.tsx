import { Suspense } from 'react';
import PinEntryForm from '@/app/components/PinEntryForm';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { generatePageMetadata, localizedMetadata } from '@/lib/metadata';
import { getCurrentLocale } from '@/locales/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const content = localizedMetadata.find[locale as keyof typeof localizedMetadata.find] || localizedMetadata.find.en;

  return generatePageMetadata(locale, {
    title: content.title,
    description: content.description,
    keywords: content.keywords,
    url: '/find',
  });
}

export default function FindPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <PinEntryForm />
      </Suspense>
    </div>
  );
}