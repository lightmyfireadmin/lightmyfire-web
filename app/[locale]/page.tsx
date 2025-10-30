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

      <div className="flex flex-row sm:flex-col items-center justify-center gap-4 sm:gap-8 py-12 sm:py-16">
        {/* Right Side (on desktop): Pin Entry Form */}
        <div className="w-full max-w-sm">
          <PinEntryForm />
        </div>

        {/* Left Side (on desktop): Hero Section */}
        <div className="text-center max-w-md px-4 p-6 bg-background/80 rounded-lg shadow-lg sm:w-full sm:max-w-none sm:items-center">
          <div className="sm:flex sm:flex-col sm:items-center">
            <div className="sm:flex sm:items-center">
              <div className="w-[80px] h-[131px] sm:w-[150px] sm:h-[246px] sm:p-2.5 mx-auto mb-4 float-left sm:float-none mr-4 sm:mr-0 sm:mb-4">
                <Image
                  src="/illustrations/thumbs_up.png"
                  alt="LightMyFire Lighter"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {t('home.hero.title')}
              </h1>
            </div>
            <div className="mt-3 flex items-center justify-center">
              <p className="text-base text-muted-foreground sm:text-lg">
                {t('home.hero.subtitle')}
              </p>
              <InfoPopup content={t('home.hero.popup_content')} />
            </div>
            <div className="relative inline-flex justify-center mt-6">
              <Link href={`/${locale}/save-lighter`} className="btn-primary">
                {t('home.hero.cta')}
              </Link>
              <Image
                src="/illustrations/CTA_rainbow_arrow.png"
                alt="Arrow pointing to CTA"
                className="absolute top-1/2 -translate-y-1/2 w-[40px] h-[40px] left-[calc(100%+10px)] sm:w-[120px] sm:h-[120px] sm:left-[calc(100%+26px)]"
              />
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="mx-auto max-w-5xl p-4 py-12 sm:p-6 lg:p-8">
        <h2 className="mb-8 text-center text-3xl font-bold text-foreground">
          {t('home.how_it_works.title')}
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {}
          <div className="rounded-lg border border-border bg-background p-6 text-center shadow-sm">
            <Image
              src="/illustrations/personalise.png"
              alt="Save a lighter"
              className="mx-auto mb-4 h-24 w-auto"
            />
            <h3 className="mb-2 text-xl font-semibold">
              {t('home.how_it_works.step1.title')}
            </h3>
            <p className="text-muted-foreground">
              {t('home.how_it_works.step1.description')}
            </p>
          </div>
          {}
          <div className="rounded-lg border border-border bg-background p-6 text-center shadow-sm">
            <Image
              src="/illustrations/around_the_world.png"
              alt="Share the lighter"
              className="mx-auto mb-4 h-24 w-auto"
            />
            <h3 className="mb-2 text-xl font-semibold">
              {t('home.how_it_works.step2.title')}
            </h3>
            <p className="text-muted-foreground">
              {t('home.how_it_works.step2.description')}
            </p>
          </div>
          {/* Step 3 */}
          <div className="rounded-lg border border-border bg-background p-6 text-center shadow-sm">
            <Image
              src="/illustrations/telling_stories.png"
              alt="Follow the story"
              className="mx-auto mb-4 h-24 w-auto"
            />
            <h3 className="mb-2 text-xl font-semibold">
              {t('home.how_it_works.step3.title')}
            </h3>
            <p className="text-muted-foreground">
              {t('home.how_it_works.step3.description')}
            </p>
          </div>
        </div>
      </div>

      <RandomPostFeed />
    </div>
  );
}