import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
// Corrected import paths assuming components is inside app/
import PinEntryForm from '@/app/components/PinEntryForm';
import PostCard from '@/app/components/PostCard';
import { DetailedPost } from '@/lib/types'; // Assuming lib is at root
import Link from 'next/link'; // Added Link import
import Image from 'next/image';
import { getI18n } from '@/locales/server';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const t = await getI18n();
  const cookieStore = cookies();
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

  // Check if user is logged in (for the PostCards)
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const isLoggedIn = session !== null;

  // Fetch 5 random public posts
  const { data: randomPosts } = await supabase.rpc(
    'get_random_public_posts',
    {
      limit_count: 5,
    }
  );

  return (
    <div className="bg-background">
      {/* PIN Entry Section (Moved up) */}
      <div className="flex w-full items-center justify-center bg-muted py-12 sm:py-16">
        <PinEntryForm />
      </div>

      {/* Hero Section (Condensed) */}
      <div className="relative isolate px-6 pt-8 pb-12 lg:px-8 lg:pt-14 lg:pb-48"> {/* Adjusted padding */}
        <div className="mx-auto max-w-3xl py-12 sm:py-16 lg:py-24"> {/* Adjusted padding */}
          <div className="text-center">
            <Image
              src="/webclip.png"
              alt="LightMyFire Lighter"
              width={150} // Slightly smaller image
              height={150}
              className="mx-auto mb-6" // Adjusted margin
            />
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"> {/* Adjusted heading size */}
              {t('home.hero.title')}
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg"> {/* Adjusted text size and leading */}
              {t('home.hero.subtitle')}
            </p>
            <div className="mt-8 flex items-center justify-center gap-x-6"> {/* Adjusted margin */}
               <Link href="/save-lighter" className="btn-primary">
                 {t('home.hero.cta')}
               </Link>
             </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16 lg:px-8 hidden sm:block"> {/* Added hidden sm:block */}
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
      {/* Community Illustration */}
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
