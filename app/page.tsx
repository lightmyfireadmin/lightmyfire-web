import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import PinEntryForm from '@/app/components/PinEntryForm';
import PostCard from '@/app/components/PostCard';
import { DetailedPost } from '@/lib/types';

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
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-3xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Every Lighter Has a Story
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We turn disposable lighters into a global, human creativity
              mosaic. Find a lighter, see its journey, and add your own chapter.
            </p>
          </div>
        </div>
      </div>

      {/* PIN Entry Section */}
      <div className="flex w-full items-center justify-center bg-gray-100 py-16">
        <PinEntryForm />
      </div>

      {/* Random Stories Section */}
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
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
            <p className="text-center text-gray-500">
              No public stories yet. Be the first to save a lighter!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}