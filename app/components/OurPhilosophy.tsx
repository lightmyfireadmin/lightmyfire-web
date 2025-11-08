'use client';

import { useState } from 'react';
import { useI18n } from '@/locales/client';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import DOMPurify from 'dompurify';

export default function OurPhilosophy() {
  const t = useI18n() as any;
  const [isExpanded, setIsExpanded] = useState(false);

  const sanitizeHTML = (html: string) => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'strong', 'em', 'u', 'br', 'a'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="rounded-lg border border-border bg-gradient-to-br from-primary/5 to-primary/10 shadow-md overflow-hidden">
        {}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-6 py-5 flex items-center justify-between hover:bg-primary/5 transition-colors"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">✨</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              {t('philosophy.title')}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {isExpanded ? t('philosophy.button.hide') : t('philosophy.button.learn_more')}
            </span>
            {isExpanded ? (
              <ChevronUpIcon className="h-6 w-6 text-primary" />
            ) : (
              <ChevronDownIcon className="h-6 w-6 text-primary" />
            )}
          </div>
        </button>

        {}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-6 pb-6 space-y-4 border-t border-border/50 pt-6">
            {}
            <p className="text-lg font-semibold text-primary italic">
              {t('philosophy.lead')}
            </p>

            {}
            <div className="space-y-4 text-gray-900 md:text-foreground">
              <div
                className="prose prose-lg max-w-none md:dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(t('philosophy.p1')) }}
              />
              <div
                className="prose prose-lg max-w-none md:dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(t('philosophy.p2')) }}
              />
              <div
                className="prose prose-lg max-w-none md:dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(t('philosophy.p3')) }}
              />
              <div
                className="prose prose-lg max-w-none md:dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(t('philosophy.p4')) }}
              />
            </div>

            {}
            <div className="flex justify-center pt-4">
              <Image
                src="/illustrations/around_the_world.png"
                alt={t('philosophy.image_alt')}
                width={300}
                height={200}
                className="rounded-lg"
                loading="lazy"
                quality={80}
              />
            </div>

            {}
            <div className="pt-4 text-center">
              <p className="text-sm text-muted-foreground italic">
                {t('philosophy.cta')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
