
'use client';

import Image from 'next/image';
import { useI18n } from '@/locales/client';
import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function FAQ() {
  const t = useI18n();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const faqItems: FAQItem[] = [
    {
      id: 'what-is',
      question: 'What is LightMyFire?',
      answer:
        'It\'s a project to reduce waste and create a "human mosaic." We sell stickers with QR codes that you put on a lighter. Anyone who finds that lighter can scan the code, enter its PIN, and add a story, picture, or song to its digital logbook. It\'s a unique way to connect people globally and give lighters a second life.',
    },
    {
      id: 'how-add-story',
      question: 'How do I add a story to a lighter?',
      answer:
        'You must find a lighter with a LightMyFire sticker. Scan the QR code (or go to our site) and enter the unique PIN from the sticker. You\'ll need to create a free account to contribute. Once logged in, you can add text, upload images, share songs, or record locations where you found the lighter.',
    },
    {
      id: 'save-lighter',
      question: 'How do I save and personalize my own lighter?',
      answer:
        'Visit the "Save a Lighter" section on our site. You\'ll give your lighter a name, choose a sticker design (pick your favorite color, language, etc.), and then order stickers with your custom design. This creates a unique digital identity for your lighter that you can track and share.',
    },
    {
      id: 'post-twice',
      question: 'Why can\'t I post twice in a row?',
      answer:
        'To keep the mosaic diverse and encourage passing the lighter on, we have a 24-hour cooldown period per lighter. This ensures that multiple people contribute stories to the same lighter rather than one person dominating it. It\'s all about creating a diverse, global human mosaic.',
    },
    {
      id: 'public-post',
      question: 'Is my post public?',
      answer:
        'You have full control! All posts are visible on the lighter\'s private page (which requires the PIN to access). When you post, you can also check a box to make it "public," which allows it to be featured on our homepage mosaic and seen by everyone visiting the site.',
    },
    {
      id: 'delete-post',
      question: 'How do I delete a post I made?',
      answer:
        'Log in and go to your "My Profile" page. You\'ll see a list of all your contributions with a delete button next to each one. You can remove any post at any time. This gives you complete control over your contributions.',
    },
    {
      id: 'lose-lighter',
      question: 'What happens if I lose the lighter I saved?',
      answer:
        'That\'s part of the adventure! As the "LightSaver" (the person who bought the sticker), you can always see your lighter\'s page from your "My Profile" dashboard. You can watch its journey and see where it goes, who finds it, and what stories it collects long after it leaves your hands.',
    },
    {
      id: 'map-works',
      question: 'How does the map feature work?',
      answer:
        'On each lighter\'s page, you\'ll find a map that shows the lighter\'s journey. Every time someone makes a "location" post, the coordinates are recorded and added to the map, tracing the lighter\'s path across the globe. It\'s a visual representation of how far your lighter travels!',
    },
    {
      id: 'trophies',
      question: 'What are trophies and how do I earn them?',
      answer:
        'Trophies are achievements that recognize your contributions to the LightMyFire community. You can earn trophies by saving lighters, adding stories and posts, creating original content, traveling to new locations, helping refuel the community spirit, and more. Check your profile to see which trophies you\'ve unlocked and what you still need to achieve!',
    },
    {
      id: 'harmful-content',
      question: 'What happens if I post harmful or offensive content?',
      answer:
        'We have a content moderation system to keep the community safe and respectful. Posts that contain hate speech, harassment, violence, or other harmful content are reviewed by our moderation team. Depending on the severity, content may be removed, you may receive a warning, or your account may be suspended. We believe in protecting all community members.',
    },
    {
      id: 'buy-stickers',
      question: 'How do I buy sticker packs?',
      answer:
        'Once you\'ve designed your lighter and customized your sticker, you can purchase sticker packs directly through our platform. We offer packs of 5, 10, 25, or 50 stickers. Use our secure Stripe payment system to complete your purchase. Your stickers will be professionally printed and shipped to you with tracking information.',
    },
    {
      id: 'sticker-design',
      question: 'Can I customize the design of my stickers?',
      answer:
        'Absolutely! When saving your lighter, you can fully personalize your stickers. Choose your background color, select the language for the invitation text (English, French, Spanish, German, Italian, or Portuguese), and customize your lighter\'s name and PIN. See a live preview of your design before ordering.',
    },
    {
      id: 'environment',
      question: 'How is LightMyFire environmentally friendly?',
      answer:
        'We\'re dedicated to reducing lighter waste. Instead of throwing away old lighters (which takes 150+ years to decompose), our project gives them a second life by creating stories around them. Each lighter saved and passed on prevents one item from ending up in landfills. Plus, we encourage refilling lighters rather than buying new ones—check our Refill Guide for tips!',
    },
    {
      id: 'languages',
      question: 'What languages does LightMyFire support?',
      answer:
        'LightMyFire is available in multiple languages: English, French, Spanish, German, Italian, and Portuguese. You can switch languages anytime using the language selector in the header. Your stickers can also be customized with text in any of these languages, making it easy to connect with people around the world.',
    },
    {
      id: 'levels',
      question: 'What is the level system?',
      answer:
        'The level system gamifies your contributions to the community. You earn points by saving lighters, adding posts and stories, earning likes from other users, and creating original content. As you accumulate points, your profile level increases from 1 to 100. Higher levels showcase your dedication to the LightMyFire mission!',
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
          Find answers to common questions about LightMyFire
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
            Can&apos;t find your answer?{' '}
            <a
              href="mailto:support@lightmyfire.com"
              className="text-primary hover:underline font-semibold"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
