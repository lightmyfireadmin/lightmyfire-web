import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import PinEntryForm from '@/app/components/PinEntryForm';
import PostCard from '@/app/components/PostCard';
import { DetailedPost } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { getI18n, getCurrentLocale } from '@/locales/server';
import RandomPostFeed from '@/app/components/RandomPostFeed';
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

      <div className="flex flex-col sm:flex-row-reverse items-center justify-center gap-8 sm:gap-16 py-12 sm:py-16">
        {/* Right Side (on desktop): Pin Entry Form */}
        <div className="w-full max-w-sm">
          <PinEntryForm />
        </div>

        {/* Left Side (on desktop): Hero Section */}
        <div className="text-center sm:text-left max-w-md px-4 p-6 bg-background/80 rounded-lg shadow-lg">
          <Image
            src="/illustrations/thumbs_up.png"
            alt="LightMyFire Lighter"
            width={250} // Increased size
            height={284}
            className="mx-auto sm:mx-0 mb-4"
          />
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('home.hero.title')}
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            {t('home.hero.subtitle')}
          </p>
          <div className="mt-6 flex items-center justify-center sm:justify-start relative">
            <Link href={`/${locale}/save-lighter`} className="btn-primary">
              {t('home.hero.cta')}
            </Link>
            <Image
              src="/illustrations/CTA_rainbow_arrow.png"
              alt="Arrow pointing to CTA"
              width={80}
              height={80}
              className="absolute -right-16 top-1/2 -translate-y-1/2 hidden sm:block"
            />
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
              width={100}
              height={100}
              className="mx-auto mb-4"
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
              width={100}
              height={100}
              className="mx-auto mb-4"
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
              width={100}
              height={100}
              className="mx-auto mb-4"
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