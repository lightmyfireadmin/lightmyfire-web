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
import AuthNotification from '@/app/components/AuthNotification';
import SignupWelcomeModal from '@/app/components/SignupWelcomeModal';
import { HeartIcon } from '@heroicons/react/24/outline';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import CommunityStats from '@/app/components/CommunityStats';
import OurPhilosophy from '@/app/components/OurPhilosophy';
import LaunchAnnouncementPopup from '@/components/LaunchAnnouncementPopup';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const t = await getI18n() as any;
  const cookieStore = cookies();
  const locale = await getCurrentLocale();
  const supabase = createServerSupabaseClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const isLoggedIn = session !== null;

  return (
    <div>
      <Suspense fallback={null}>
        <AuthNotification />
      </Suspense>
      <Suspense fallback={null}>
        <SignupWelcomeModal />
      </Suspense>
      {!isLoggedIn && <LaunchAnnouncementPopup />}

      {}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-1.5 lg:gap-2 py-4 lg:py-6 px-4 sm:px-6">
        {}
        <div className="w-full lg:w-auto text-center lg:text-left max-w-md">
          {}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
            <div className="h-[131px] lg:h-[197px] mx-auto lg:mx-0 flex-shrink-0">
              <Image
                src="/illustrations/thumbs_up.png"
                alt="LightMyFire - Give lighters a second life"
                width={80}
                height={131}
                priority
                className="h-full w-auto object-contain"
              />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              {t('home.hero.title')}
            </h1>
          </div>

          {}
          <div className="rounded-lg bg-primary/5 p-4 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-2 justify-center lg:justify-start">
              <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
                {t('home.hero.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {}
        <div className="w-full max-w-sm lg:w-auto lg:flex-shrink-0">
          <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="text-muted-foreground">Loading...</div></div>}>
            <PinEntryForm />
          </Suspense>
        </div>
      </div>

      {}
      <div className="mx-auto w-full max-w-4xl px-4 py-4 lg:py-6 mb-3 lg:mb-1">
        <div className="rounded-lg border border-border bg-background/95 p-8 sm:p-10 shadow-md">
          <h2 className="mb-4 text-center text-2xl sm:text-3xl font-bold text-foreground">
            {t('home.become_lightsaver.title')}
          </h2>
          <p className="mb-8 text-center text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {t('home.become_lightsaver.subtitle')}
          </p>
          <div className="flex justify-center">
            <div className="relative inline-flex">
              <Link
                href={`/${locale}/save-lighter`}
                className="inline-flex items-center gap-x-2 px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition shadow-md hover:shadow-lg opacity-90 hover:opacity-100"
              >
                <HeartIcon className="h-5 w-5" />
                {t('home.hero.cta')}
              </Link>
              <Image
                src="/illustrations/CTA_rainbow_arrow.png"
                alt="Arrow pointing to save lighter button"
                width={100}
                height={100}
                className="absolute top-1/2 -translate-y-1/2 w-[60px] h-[60px] lg:w-[100px] lg:h-[100px] left-[calc(100%+8px)] lg:left-[calc(100%+12px)]"
                loading="lazy"
                quality={80}
              />
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <h2 className="mb-4 text-center text-2xl sm:text-3xl font-bold text-foreground">
          {t('home.how_it_works.title')}
        </h2>
        <div className="grid grid-cols-1 gap-1.5 md:gap-2 md:grid-cols-3">
          {}
          <div className="rounded-lg border border-border bg-background p-5 sm:p-6 text-center shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
            <div className="h-32 flex items-center justify-center overflow-hidden mb-4">
              <Image
                src="/illustrations/personalise.png"
                alt="Save a lighter"
                width={120}
                height={128}
                className="h-full w-auto object-contain"
                loading="lazy"
                quality={80}
              />
            </div>
            <h3 className="mb-2 text-lg sm:text-xl font-semibold text-foreground">
              {t('home.how_it_works.step1.title')}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed flex-1">
              {t('home.how_it_works.step1.description')}
            </p>
          </div>

          {}
          <div className="rounded-lg border border-border bg-background p-5 sm:p-6 text-center shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
            <div className="h-32 flex items-center justify-center overflow-hidden mb-4">
              <Image
                src="/illustrations/around_the_world.png"
                alt="Share the lighter"
                width={120}
                height={128}
                className="h-full w-auto object-contain"
                loading="lazy"
                quality={80}
              />
            </div>
            <h3 className="mb-2 text-lg sm:text-xl font-semibold text-foreground">
              {t('home.how_it_works.step2.title')}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed flex-1">
              {t('home.how_it_works.step2.description')}
            </p>
          </div>

          {}
          <div className="rounded-lg border border-border bg-background p-5 sm:p-6 text-center shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
            <div className="h-32 flex items-center justify-center overflow-hidden mb-4">
              <Image
                src="/illustrations/telling_stories.png"
                alt="Follow the story"
                width={120}
                height={128}
                className="h-full w-auto object-contain"
                loading="lazy"
                quality={80}
              />
            </div>
            <h3 className="mb-2 text-lg sm:text-xl font-semibold text-foreground">
              {t('home.how_it_works.step3.title')}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed flex-1">
              {t('home.how_it_works.step3.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Community Impact Statistics */}
      <CommunityStats />

      {/* Our Philosophy - Expandable Section */}
      <OurPhilosophy />

      <RandomPostFeed />
    </div>
  );
}