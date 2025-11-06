
'use client';

import Image from 'next/image';
import { useI18n } from '@/locales/client';
import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import ContactFormModal from '@/app/components/ContactFormModal';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function FAQ() {
  const t = useI18n();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  const faqItems: FAQItem[] = [
    {
      id: 'what-is',
      question: t('faq.what_is.question'),
      answer: t('faq.what_is.answer'),
    },
    {
      id: 'how-add-story',
      question: t('faq.how_add_story.question'),
      answer: t('faq.how_add_story.answer'),
    },
    {
      id: 'save-lighter',
      question: t('faq.save_lighter.question'),
      answer: t('faq.save_lighter.answer'),
    },
    {
      id: 'post-twice',
      question: t('faq.post_twice.question'),
      answer: t('faq.post_twice.answer'),
    },
    {
      id: 'public-post',
      question: t('faq.public_post.question'),
      answer: t('faq.public_post.answer'),
    },
    {
      id: 'delete-post',
      question: t('faq.delete_post.question'),
      answer: t('faq.delete_post.answer'),
    },
    {
      id: 'lose-lighter',
      question: t('faq.lose_lighter.question'),
      answer: t('faq.lose_lighter.answer'),
    },
    {
      id: 'map-works',
      question: t('faq.map_works.question'),
      answer: t('faq.map_works.answer'),
    },
    {
      id: 'trophies',
      question: t('faq.trophies.question'),
      answer: t('faq.trophies.answer'),
    },
    {
      id: 'harmful-content',
      question: t('faq.harmful_content.question'),
      answer: t('faq.harmful_content.answer'),
    },
    {
      id: 'buy-stickers',
      question: t('faq.buy_stickers.question'),
      answer: t('faq.buy_stickers.answer'),
    },
    {
      id: 'sticker-design',
      question: t('faq.sticker_design.question'),
      answer: t('faq.sticker_design.answer'),
    },
    {
      id: 'environment',
      question: t('faq.environment.question'),
      answer: t('faq.environment.answer'),
    },
    {
      id: 'languages',
      question: t('faq.languages.question'),
      answer: t('faq.languages.answer'),
    },
    {
      id: 'levels',
      question: t('faq.levels.question'),
      answer: t('faq.levels.answer'),
    },
  ];

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="mx-auto max-w-3xl p-4 py-12 sm:p-6 lg:p-8">
      <div className="rounded-lg border border-border bg-background p-8 shadow-sm">
        <Image
          src="/illustrations/assistance_questions.png"
          alt={t('legal.faq.title')}
          width={150}
          height={150}
          className="mx-auto mb-6"
        />
        <h1 className="mb-2 text-center text-4xl font-bold text-foreground">
          {t('legal.faq.title')}
        </h1>
        <p className="mb-8 text-center text-muted-foreground">
          {t('faq.subtitle')}
        </p>

        {}
        <div className="space-y-3">
          {faqItems.map((item) => (
            <div
              key={item.id}
              className="border border-border rounded-lg overflow-hidden transition-all duration-200"
            >
              {}
              <button
                onClick={() => toggleExpanded(item.id)}
                className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-muted/50 transition-colors text-left"
              >
                <h3 className="font-semibold text-foreground pr-4 flex-1">
                  {item.question}
                </h3>
                <ChevronDownIcon
                  className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                    expandedId === item.id ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {}
              {expandedId === item.id && (
                <div className="px-4 sm:px-5 py-4 sm:py-5 mt-2 bg-muted/30 border-t border-border text-muted-foreground leading-relaxed">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-center text-muted-foreground">
            {t('faq.contact_footer')}{' '}
            <button
              onClick={() => setShowContactModal(true)}
              className="text-primary hover:underline font-semibold"
            >
              {t('faq.contact_link')}
            </button>
          </p>
        </div>
      </div>

      {/* Contact Form Modal */}
      <ContactFormModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        context="faq"
      />
    </div>
  );
}
