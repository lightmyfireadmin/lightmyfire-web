import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import PinEntryForm from '@/app/components/PinEntryForm';
import PostCard from '@/app/components/PostCard';
import { DetailedPost } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { getI18n, getCurrentLocale } from '@/locales/server';
import RandomPostFeed from '@/app/components/RandomPostFeed';

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
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 py-12 sm:py-16">
        {/* Left Side: Hero Section */}
        <div className="text-center sm:text-left max-w-md">
          <Image
            src="/illustrations/thumbs_up.png"
            alt="LightMyFire Lighter"
            width={150}
            height={170}
            className="mx-auto sm:mx-0 mb-4"
          />
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('home.hero.title')}
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            {t('home.hero.subtitle')}
          </p>
          <div className="mt-6">
            <Link href={`/${locale}/save-lighter`} className="btn-primary">
              {t('home.hero.cta')}
            </Link>
          </div>
        </div>

        {/* Right Side: Pin Entry Form */}
        <div className="w-full max-w-sm">
          <PinEntryForm />
        </div>
      </div>

      <RandomPostFeed />
    </div>
  );
}