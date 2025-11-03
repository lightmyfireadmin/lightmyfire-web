'use client';

import Image from 'next/image';
import { useI18n } from '@/locales/client';

export default function DontThrowMeAwayPage() {
  const t = useI18n();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Statistics */}
      <div className="bg-gradient-to-b from-primary/10 to-background py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-center text-4xl sm:text-5xl font-bold text-foreground mb-4">
            {t('refill_guide.title')}
          </h1>
          <p className="text-center text-lg text-muted-foreground mb-8">
            {t('refill_guide.subtitle')}
          </p>

          {/* Statistics Cards */}
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

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {/* Introduction */}
          <div className="rounded-lg border border-border bg-background/95 p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t('refill_guide.hero_title')}
            </h2>
            <div className="prose prose-lg max-w-none text-foreground space-y-4">
              <p>
                {t('refill_guide.hero_intro')}
              </p>
              <p>
                {t('refill_guide.hero_social')}
              </p>
            </div>
          </div>

          {/* How to Recognize Section */}
          <div className="rounded-lg border border-border bg-background/95 p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              {t('refill_guide.section1_title')}
            </h2>
            <p className="text-foreground mb-8 text-lg">
              {t('refill_guide.section1_intro')}
            </p>

            <div className="space-y-6">
              {/* Butane Lighters */}
              <div className="rounded-lg border border-border/50 p-6 bg-background">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <span className="text-2xl">⛽</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {t('refill_guide.section1_type1_title')}
                    </h3>
                    <p className="text-foreground text-sm leading-relaxed">
                      {t('refill_guide.section1_type1.desc')}
                    </p>
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

              {/* Fluid Lighters */}
              <div className="rounded-lg border border-border/50 p-6 bg-background">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <span className="text-2xl">🔧</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {t('refill_guide.section1_type2_title')}
                    </h3>
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

              {/* Disposable Lighters */}
              <div className="rounded-lg border border-border/50 p-6 bg-background">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                      <span className="text-2xl">🗑️</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {t('refill_guide.section1_type3_title')}
                    </h3>
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

          {/* How to Refill Section */}
          <div className="rounded-lg border border-border bg-background/95 p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-foreground mb-8">
              {t('refill_guide.section2_title')}
            </h2>

            <div className="space-y-8">
              {/* Butane Refill */}
              <div className="rounded-lg border border-border/50 p-8 bg-background">
                <h3 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                  <span className="text-3xl">⛽</span>
                  {t('refill_guide.section2_type1_title')}
                </h3>

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
                    <p className="text-sm text-foreground">
                      {t('refill_guide.section2_type1_step2_desc')}
                    </p>
                  </div>

                  <div className="rounded-lg bg-primary/5 p-6 border border-primary/20">
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <span className="text-lg">3️⃣</span>
                      {t('refill_guide.section2_type1_step3_title')}
                    </h4>
                    <ol className="text-sm text-foreground space-y-3 list-decimal list-inside">
                      <li>{t('refill_guide.section2_type1_step3_li1')}</li>
                      <li>{t('refill_guide.section2_type1_step3_li2')}</li>
                      <li>{t('refill_guide.section2_type1_step3_li3')}</li>
                      <li>{t('refill_guide.section2_type1_step3_li4')}</li>
                      <li>{t('refill_guide.section2_type1_step3_li5')}</li>
                    </ol>
                  </div>

                  <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 p-4 border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-900 dark:text-yellow-200">
                      💡 <strong>Pro tip:</strong> Always wear safety glasses when refilling. If you feel resistance, do not force it—wait a few seconds and try again.
                    </p>
                  </div>
                </div>
              </div>

              {/* Fluid Refill */}
              <div className="rounded-lg border border-border/50 p-8 bg-background">
                <h3 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                  <span className="text-3xl">🔧</span>
                  {t('refill_guide.section2_type2_title')}
                </h3>

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
                    <p className="text-sm text-foreground">
                      {t('refill_guide.section2_type2_step2_desc')}
                    </p>
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

                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-900 dark:text-blue-200">
                      ⚠️ <strong>Important:</strong> Never overfill fluid lighters. Let the lighter dry for 24 hours after refilling before use.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Why It Matters */}
          <div className="rounded-lg border border-border bg-background/95 p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-foreground mb-6">Why It Matters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="text-2xl">🌍</span> Environmental Impact
                </h3>
                <p className="text-sm text-foreground">
                  One refillable lighter can replace 50+ disposable lighters in its lifetime. That&apos;s 50+ lighters kept out of landfills for one person.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="text-2xl">💰</span> Cost Savings
                </h3>
                <p className="text-sm text-foreground">
                  A quality refillable lighter costs €5-20 but lasts years. Disposables cost €1-2 each. Refillables pay for themselves within months.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="text-2xl">❤️</span> Reliability
                </h3>
                <p className="text-sm text-foreground">
                  Refillable lighters are built to last decades. They&apos;re more reliable in cold weather and harsh conditions than cheap disposables.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="text-2xl">🎯</span> Our Mission
                </h3>
                <p className="text-sm text-foreground">
                  Every lighter you save with LightMyFire gets a story. Give your lighter a name, and it becomes more than an object—it becomes a companion.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="rounded-lg border-2 border-primary bg-primary/10 p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Ready to Save Your First Lighter?
            </h2>
            <p className="text-foreground mb-6">
              Choose a refillable lighter, give it a name, and start its journey with LightMyFire.
            </p>
            <a
              href="/save-lighter"
              className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              Save Your First Lighter
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
