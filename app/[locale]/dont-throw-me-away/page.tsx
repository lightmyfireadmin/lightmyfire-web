'use client';

import Image from 'next/image';
import { useI18n } from '@/locales/client';
import DOMPurify from 'isomorphic-dompurify';

export default function DontThrowMeAwayPage() {
  const t = useI18n();

  const sanitizeHTML = (html: string) => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'strong', 'em', 'u', 'br', 'a', 'li', 'ol', 'ul'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {}
      <div className="bg-gradient-to-b from-primary/10 to-background py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-center text-4xl sm:text-5xl font-bold text-foreground mb-4">
            {t('refill_guide.title')}
          </h1>
          <p className="text-center text-lg text-muted-foreground mb-8">
            {t('refill_guide.subtitle')}
          </p>

          {}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-6 text-center">
              <p className="text-4xl font-bold text-primary mb-2">650M</p>
              <p className="text-sm font-semibold text-foreground">Disposable lighters sold yearly</p>
              <p className="text-xs text-muted-foreground mt-2">Worldwide</p>
            </div>
            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-6 text-center">
              <p className="text-4xl font-bold text-primary mb-2">150+</p>
              <p className="text-sm font-semibold text-foreground">Years to decompose</p>
              <p className="text-xs text-muted-foreground mt-2">In landfills</p>
            </div>
            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-6 text-center">
              <p className="text-4xl font-bold text-primary mb-2">90%</p>
              <p className="text-sm font-semibold text-foreground">Waste reduction</p>
              <p className="text-xs text-muted-foreground mt-2">With refillable lighters</p>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {}
          <div className="rounded-lg border border-border bg-background/95 p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t('refill_guide.hero_title')}
            </h2>
            <div className="prose prose-lg max-w-none text-foreground space-y-4">
              <p dangerouslySetInnerHTML={{ __html: sanitizeHTML(t('refill_guide.hero_intro')) }} />
              <p dangerouslySetInnerHTML={{ __html: sanitizeHTML(t('refill_guide.hero_social')) }} />
            </div>
          </div>

          {}
          <div className="rounded-lg border border-border bg-background/95 p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              {t('refill_guide.section1_title')}
            </h2>
            <p className="text-foreground mb-8 text-lg">
              {t('refill_guide.section1_intro')}
            </p>

            <div className="space-y-6">
              {}
              <div className="rounded-lg border border-border/50 p-6 bg-background">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="flex-shrink-0 w-full md:w-48">
                    <Image
                      src="/newassets/butane_refillable.png"
                      alt="Butane Refillable Lighter"
                      width={192}
                      height={192}
                      className="w-full h-auto object-contain"
                      loading="lazy"
                      quality={75}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <span className="text-2xl">⛽</span>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {t('refill_guide.section1_type1_title')}
                      </h3>
                    </div>
                    <p className="text-foreground text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHTML(t('refill_guide.section1_type1.desc')) }} />
                    <div className="mt-4 pt-4 border-t border-border/30">
                      <p className="text-xs text-muted-foreground font-semibold mb-2">Key indicators:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>✓ Small round metal valve on the bottom</li>
                        <li>✓ Similar to a tire valve</li>
                        <li>✓ Most common type</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {}
              <div className="rounded-lg border border-border/50 p-6 bg-background">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="flex-shrink-0 w-full md:w-48">
                    <Image
                      src="/newassets/gasoline_refillable.png"
                      alt="Gasoline Refillable Lighter"
                      width={192}
                      height={192}
                      className="w-full h-auto object-contain"
                      loading="lazy"
                      quality={75}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <span className="text-2xl">🔧</span>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {t('refill_guide.section1_type2_title')}
                      </h3>
                    </div>
                    <p className="text-foreground text-sm leading-relaxed">
                      {t('refill_guide.section1_type2_desc')}
                    </p>
                    <div className="mt-4 pt-4 border-t border-border/30">
                      <p className="text-xs text-muted-foreground font-semibold mb-2">Key indicators:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>✓ Metal lighter (often iconic design)</li>
                        <li>✓ Inner block can be pulled out</li>
                        <li>✓ Cotton visible inside</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {}
              <div className="rounded-lg border border-border/50 p-6 bg-background">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="flex-shrink-0 w-full md:w-48">
                    <Image
                      src="/newassets/non_refillable.png"
                      alt="Non-Refillable Lighter"
                      width={192}
                      height={192}
                      className="w-full h-auto object-contain"
                      loading="lazy"
                      quality={75}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                        <span className="text-2xl">🗑️</span>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {t('refill_guide.section1_type3_title')}
                      </h3>
                    </div>
                    <p className="text-foreground text-sm leading-relaxed">
                      {t('refill_guide.section1_type3_desc')}
                    </p>
                    <div className="mt-4 pt-4 border-t border-border/30">
                      <p className="text-xs text-muted-foreground font-semibold mb-2">Key indicators:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>✗ Flat, sealed plastic bottom</li>
                        <li>✗ No valve or removable parts</li>
                        <li>✗ Single-use only</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="rounded-lg border border-border bg-background/95 p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-foreground mb-8">
              {t('refill_guide.section2_title')}
            </h2>

            <div className="space-y-8">
              {}
              <div className="rounded-lg border border-border/50 p-8 bg-background">
                <h3 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                  <span className="text-3xl">💨</span>
                  {t('refill_guide.section2_type1_title')}
                </h3>

                <div className="mb-6 flex justify-center">
                  <Image
                    src="/newassets/butane_refill_process.png"
                    alt="Butane Lighter Refill Process"
                    width={267}
                    height={133}
                    className="w-2/3 sm:w-1/2 lg:w-1/3 h-auto rounded-lg"
                    loading="lazy"
                    quality={75}
                  />
                </div>

                <div className="space-y-6">
                  <div className="rounded-lg bg-primary/5 p-6 border border-primary/20">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <span className="text-lg">1️⃣</span>
                      {t('refill_guide.section2_type1_step1_title')}
                    </h4>
                    <p className="text-sm text-foreground">
                      {t('refill_guide.section2_type1_step1_desc')}
                    </p>
                  </div>

                  <div className="rounded-lg bg-primary/5 p-6 border border-primary/20">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <span className="text-lg">2️⃣</span>
                      {t('refill_guide.section2_type1_step2_title')}
                    </h4>
                    <p className="text-sm text-foreground" dangerouslySetInnerHTML={{ __html: sanitizeHTML(t('refill_guide.section2_type1_step2_desc')) }} />
                  </div>

                  <div className="rounded-lg bg-primary/5 p-6 border border-primary/20">
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <span className="text-lg">3️⃣</span>
                      {t('refill_guide.section2_type1_step3_title')}
                    </h4>
                    <ol className="text-sm text-foreground space-y-3 list-decimal list-inside">
                      <li dangerouslySetInnerHTML={{ __html: sanitizeHTML(t('refill_guide.section2_type1_step3_li1')) }} />
                      <li dangerouslySetInnerHTML={{ __html: sanitizeHTML(t('refill_guide.section2_type1_step3_li2')) }} />
                      <li dangerouslySetInnerHTML={{ __html: sanitizeHTML(t('refill_guide.section2_type1_step3_li3')) }} />
                      <li dangerouslySetInnerHTML={{ __html: sanitizeHTML(t('refill_guide.section2_type1_step3_li4')) }} />
                      <li dangerouslySetInnerHTML={{ __html: sanitizeHTML(t('refill_guide.section2_type1_step3_li5')) }} />
                    </ol>
                  </div>

                  <div className="rounded-lg bg-yellow-100 dark:bg-yellow-900/30 p-4 border-2 border-yellow-400 dark:border-yellow-600">
                    <p className="text-sm text-yellow-900 dark:text-yellow-100 font-medium">
                      💡 <strong className="text-yellow-800 dark:text-yellow-200">Pro tip:</strong> {t('refill_guide.pro_tip_butane')}
                    </p>
                  </div>
                </div>
              </div>

              {}
              <div className="rounded-lg border border-border/50 p-8 bg-background">
                <h3 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                  <span className="text-3xl">⛽</span>
                  {t('refill_guide.section2_type2_title')}
                </h3>

                <div className="mb-6 flex justify-center">
                  <Image
                    src="/newassets/gasoline_refill_process.png"
                    alt="Gasoline Lighter Refill Process"
                    width={267}
                    height={133}
                    className="w-2/3 sm:w-1/2 lg:w-1/3 h-auto rounded-lg"
                    loading="lazy"
                    quality={75}
                  />
                </div>

                <div className="space-y-6">
                  <div className="rounded-lg bg-primary/5 p-6 border border-primary/20">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <span className="text-lg">1️⃣</span>
                      {t('refill_guide.section2_type2_step1_title')}
                    </h4>
                    <p className="text-sm text-foreground">
                      {t('refill_guide.section2_type2_step1_desc')}
                    </p>
                  </div>

                  <div className="rounded-lg bg-primary/5 p-6 border border-primary/20">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <span className="text-lg">2️⃣</span>
                      {t('refill_guide.section2_type2_step2_title')}
                    </h4>
                    <p className="text-sm text-foreground" dangerouslySetInnerHTML={{ __html: sanitizeHTML(t('refill_guide.section2_type2_step2_desc')) }} />
                  </div>

                  <div className="rounded-lg bg-primary/5 p-6 border border-primary/20">
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <span className="text-lg">3️⃣</span>
                      {t('refill_guide.section2_type2_step3_title')}
                    </h4>
                    <ol className="text-sm text-foreground space-y-3 list-decimal list-inside">
                      <li>{t('refill_guide.section2_type2_step3_li1')}</li>
                      <li>{t('refill_guide.section2_type2_step3_li2')}</li>
                      <li>{t('refill_guide.section2_type2_step3_li3')}</li>
                      <li>{t('refill_guide.section2_type2_step3_li4')}</li>
                      <li>{t('refill_guide.section2_type2_step3_li5')}</li>
                    </ol>
                  </div>

                  <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-4 border-2 border-blue-400 dark:border-blue-600">
                    <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                      ⚠️ <strong className="text-blue-800 dark:text-blue-200">Important:</strong> {t('refill_guide.important_gasoline')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="rounded-lg border border-border bg-background/95 p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-foreground mb-6">{t('refill_guide.why_it_matters.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="text-2xl">🌍</span> {t('refill_guide.why_it_matters.environmental.title')}
                </h3>
                <p className="text-sm text-foreground">
                  {t('refill_guide.why_it_matters.environmental.description')}
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="text-2xl">💰</span> {t('refill_guide.why_it_matters.cost.title')}
                </h3>
                <p className="text-sm text-foreground">
                  {t('refill_guide.why_it_matters.cost.description')}
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="text-2xl">❤️</span> {t('refill_guide.why_it_matters.reliability.title')}
                </h3>
                <p className="text-sm text-foreground">
                  {t('refill_guide.why_it_matters.reliability.description')}
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="text-2xl">🎯</span> {t('refill_guide.why_it_matters.mission.title')}
                </h3>
                <p className="text-sm text-foreground">
                  {t('refill_guide.why_it_matters.mission.description')}
                </p>
              </div>
            </div>
          </div>

          {}
          <div className="rounded-lg border-2 border-primary bg-primary/10 p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {t('refill_guide.cta.title')}
            </h2>
            <p className="text-foreground mb-6">
              {t('refill_guide.cta.description')}
            </p>
            <a
              href="/save-lighter"
              className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              {t('my_profile.save_first_lighter')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
