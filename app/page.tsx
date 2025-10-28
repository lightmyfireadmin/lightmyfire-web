import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
// Corrected import paths assuming components is inside app/
import PinEntryForm from '@/app/components/PinEntryForm';
import PostCard from '@/app/components/PostCard';
import { DetailedPost } from '@/lib/types'; // Assuming lib is at root
import Link from 'next/link'; // Added Link import

export const dynamic = 'force-dynamic';

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
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
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        {/* Adjusted padding */}
        <div className="mx-auto max-w-3xl py-24 sm:py-32 lg:py-48">
          <div className="text-center">
            {/* Adjusted heading size */}
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              I&apos;m Too Young To Die
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              They toss billions of us Lighter Babies every year. Found, loved, lost, forgotten... But we hear stories! Give us a chance to tell them.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
               <Link href="/save-lighter" className="btn-primary">
                 Become a LightSaver
               </Link>
             </div>
          </div>
        </div>
      </div>

      {/* PIN Entry Section */}
      <div className="flex w-full items-center justify-center bg-muted py-12 sm:py-16"> {/* Adjusted padding */}
        <PinEntryForm />
      </div>

      {/* Random Stories Section */}
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16 lg:px-8"> {/* Adjusted padding */}
        <h2 className="mb-8 text-center text-3xl font-bold text-foreground">
          Stories from the Mosaic
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
              No public stories yet. Be the first to save a lighter!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}