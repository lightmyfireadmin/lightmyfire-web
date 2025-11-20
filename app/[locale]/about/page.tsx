'use client';

import Image from 'next/image';
import { useI18n } from '@/locales/client';
import DOMPurify from 'dompurify';

export default function AboutPage() {
  const t = useI18n();

  const sanitizeHTML = (html: string) => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'strong', 'em', 'u', 'br', 'a'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    });
  };

  return (
    <div className="mx-auto max-w-3xl p-4 py-12 sm:p-6 lg:p-8">
      <div className="rounded-lg border border-border bg-background p-8 shadow-sm">
        <h1 className="mb-6 text-center text-4xl font-bold text-foreground">
          {t('philosophy.title')}
        </h1>
        <div className="space-y-6">
          <p className="lead font-semibold text-lg text-primary">
            {t('philosophy.lead')}
          </p>
          <div
            className="prose prose-lg max-w-none"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is sanitized
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(t('philosophy.p1')) }}
          />
          <div
            className="prose prose-lg max-w-none"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is sanitized
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(t('philosophy.p2')) }}
          />
          <div
            className="prose prose-lg max-w-none"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is sanitized
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(t('philosophy.p3')) }}
          />
          <div
            className="prose prose-lg max-w-none"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is sanitized
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(t('philosophy.p4')) }}
          />
          <Image
            src="/illustrations/around_the_world.png"
            alt={t('philosophy.image_alt')}
            width={300}
            height={200}
            className="mx-auto my-6"
            loading="lazy"
            quality={80}
          />
          <p className="lead mt-6 font-semibold text-lg text-primary text-center">
            {t('philosophy.cta')}
          </p>
        </div>
      </div>
    </div>
  );
}
