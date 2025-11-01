import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import PinEntryForm from '@/app/components/PinEntryForm';
import PostCard from '@/app/components/PostCard';
import { DetailedPost } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { getI18n, getCurrentLocale } from '@/locales/server';
import RandomPostFeed from '@/app/components/RandomPostFeed';
import InfoPopup from '@/app/components/InfoPopup';
import { Suspense } from 'react';
import SuccessNotification from '@/app/components/SuccessNotification';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const t = await getI18n();
  const cookieStore = cookies();
  const locale = await getCurrentLocale();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const isLoggedIn = session !== null;

  return (
    <div>
      <Suspense fallback={null}>
        <SuccessNotification />
      </Suspense>

      {/* Hero Section: Stack vertically on mobile, side-by-side on desktop */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 py-8 lg:py-12 px-4 sm:px-6">
        {/* Hero Intro - Top on mobile, left on desktop */}
        <div className="w-full lg:w-auto text-center lg:text-left max-w-md">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
            <div className="w-[100px] h-[164px] lg:w-[120px] lg:h-[197px] mx-auto lg:mx-0 flex-shrink-0">
              <Image
                src="/illustrations/thumbs_up.png"
                alt="LightMyFire - Give lighters a second life"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
              {t('home.hero.title')}
            </h1>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-2 justify-center lg:justify-start mb-6">
            <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
              {t('home.hero.subtitle')}
            </p>
            <InfoPopup content={t('home.hero.popup_content')} />
          </div>
        </div>

        {/* Pin Entry Form - Bottom on mobile, right on desktop */}
        <div className="w-full max-w-sm lg:w-auto lg:flex-shrink-0">
          <PinEntryForm />
        </div>
      </div>

      {/* Save a Lighter CTA - Below hero section */}
      <div className="flex justify-center px-4 mb-12 lg:mb-6">
        <div className="relative inline-flex">
          <Link href={`/${locale}/save-lighter`} className="btn-primary">
            {t('home.hero.cta')}
          </Link>
          <Image
            src="/illustrations/CTA_rainbow_arrow.png"
            alt="Arrow pointing to save lighter button"
            className="absolute top-1/2 -translate-y-1/2 w-[60px] h-[60px] lg:w-[100px] lg:h-[100px] right-[calc(100%-10px)] lg:right-[calc(100%+15px)]"
            priority
          />
        </div>
      </div>

      {/* How It Works Section */}
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <h2 className="mb-8 text-center text-2xl sm:text-3xl font-bold text-foreground">
          {t('home.how_it_works.title')}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:gap-8 md:grid-cols-3">
          {/* Step 1 */}
          <div className="rounded-lg border border-border bg-background p-5 sm:p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <Image
              src="/illustrations/personalise.png"
              alt="Save a lighter"
              className="mx-auto mb-4 h-20 sm:h-24 w-auto"
            />
            <h3 className="mb-2 text-lg sm:text-xl font-semibold text-foreground">
              {t('home.how_it_works.step1.title')}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t('home.how_it_works.step1.description')}
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-lg border border-border bg-background p-5 sm:p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <Image
              src="/illustrations/around_the_world.png"
              alt="Share the lighter"
              className="mx-auto mb-4 h-20 sm:h-24 w-auto"
            />
            <h3 className="mb-2 text-lg sm:text-xl font-semibold text-foreground">
              {t('home.how_it_works.step2.title')}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t('home.how_it_works.step2.description')}
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-lg border border-border bg-background p-5 sm:p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <Image
              src="/illustrations/telling_stories.png"
              alt="Follow the story"
              className="mx-auto mb-4 h-20 sm:h-24 w-auto"
            />
            <h3 className="mb-2 text-lg sm:text-xl font-semibold text-foreground">
              {t('home.how_it_works.step3.title')}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t('home.how_it_works.step3.description')}
            </p>
          </div>
        </div>
      </div>

      <RandomPostFeed />
    </div>
  );
}