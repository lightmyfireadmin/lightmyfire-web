import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import PinEntryForm from '@/app/components/PinEntryForm';
import PostCard from '@/app/components/PostCard';
import { DetailedPost } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { getI18n, getCurrentLocale } from '@/locales/server';

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

  let randomPosts: DetailedPost[] = [];

  try {
    const { data, error } = await supabase.rpc(
      'get_random_public_posts',
      {
        limit_count: 5,
      }
    );

    if (error) {
      console.error('Error fetching random posts:', error.message);
    } else if (data) {
      console.log('Random posts data:', data);
      randomPosts = data;
    }
  } catch (error) {
    console.error('Unexpected error in RPC call:', error);
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 bg-muted py-12 sm:py-16">
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

      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16 lg:px-8 hidden sm:block">
        <h2 className="mb-8 text-center text-3xl font-bold text-foreground">
          {t('home.mosaic.title')}
        </h2>
        <div className="space-y-6">
          {randomPosts && randomPosts.length > 0 ? (
            randomPosts.map((post: DetailedPost) => (
              <PostCard
                key={post.id}
                post={post}
                isLoggedIn={isLoggedIn}
              />
            ))
          ) : (
            <p className="text-center text-muted-foreground">
              {t('home.mosaic.no_stories')}
            </p>
          )}
        </div>
      </div>
      
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16 lg:px-8 text-center">
        <Image
          src="/illustrations/community.png"
          alt="Community"
          width={300}
          height={200}
          className="mx-auto mb-6"
        />
        <h2 className="text-3xl font-bold text-foreground">{t('home.community.title')}</h2>
        <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
          {t('home.community.subtitle')}
        </p>
      </div>
    </div>
  );
}

