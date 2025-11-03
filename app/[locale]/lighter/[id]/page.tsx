import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
// Assuming PostCard is inside app/components/
import PostCard from '@/app/components/PostCard';
import EmptyLighterPosts from '@/app/components/EmptyLighterPosts';
import { DetailedPost } from '@/lib/types'; // Assuming lib is at root
import type { Metadata } from 'next';
import MapComponent from './MapComponent'; // Import MapComponent
import { Suspense } from 'react';
import SuccessNotification from '@/app/components/SuccessNotification';
import Image from 'next/image';
import { PlusIcon } from '@heroicons/react/24/outline';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// --- generateMetadata Function (Remains the same) ---
export async function generateMetadata({
  params,
}: {
  params: { id: string; locale: string };
}): Promise<Metadata> {
  const cookieStore = cookies();
  const supabase = createServerSupabaseClient(cookieStore);
  const { data: lighter } = await supabase
    .from('lighters')
    .select('name, custom_background_url')
    .eq('id', params.id)
    .single();

  if (!lighter) {
    return {
      title: 'Lighter Not Found | LightMyFire',
      description: 'A human creativity mosaic.',
    };
  }
  return {
    title: `${lighter.name} | LightMyFire`,
    description: `See the story of a lighter named "${lighter.name}". Add your own chapter to its journey!`,
    openGraph: {
      title: lighter.name,
      description: 'See its story on LightMyFire',
      images: [
        {
          url: lighter.custom_background_url || '/default-og-image.png', // Create this default image in /public
          width: 1200,
          height: 630,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: lighter.name,
      description: 'See its story on LightMyFire',
      images: [lighter.custom_background_url || '/default-og-image.png'],
    },
  };
}
// --- END of generateMetadata Function ---


// --- Main Page Component ---
export default async function LighterPage({
  params,
}: {
  params: { id: string; locale: string };
}) {
  const cookieStore = cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const isLoggedIn = session !== null;

  const { data: lighter } = await supabase
    .from('lighters')
    .select('id, name, pin_code, custom_background_url, saver_id')
    .eq('id', params.id)
    .single();

  if (!lighter) {
    notFound();
  }

  // Fetch saver info
  let saverUsername = '';
  if (lighter.saver_id) {
    const { data: saverProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', lighter.saver_id)
      .single();

    saverUsername = saverProfile?.username || 'Anonymous';
  }

  // Try detailed_posts view first, fallback to posts table directly
  let postsResponse = await supabase
    .from('detailed_posts')
    .select('*')
    .eq('lighter_id', params.id)
    .order('created_at', { ascending: false });

  // Fallback: if detailed_posts view doesn't exist or returns error, use posts table with joins
  if (postsResponse.error || !postsResponse.data) {
    postsResponse = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content_text,
        content_url,
        post_type,
        created_at,
        user_id,
        lighter_id,
        location_lat,
        location_lng,
        location_name,
        is_find_location,
        is_creation,
        is_anonymous,
        is_pinned,
        is_public,
        is_flagged,
        flagged_count,
        profiles:user_id (username, nationality, show_nationality, role),
        lighters:lighter_id (name)
      `)
      .eq('lighter_id', params.id)
      .order('created_at', { ascending: false });
  }

  const { data: posts } = postsResponse;

  // Extract location data for the map
  const locationData = posts
    ?.filter(
      (post) =>
        post.post_type === 'location' &&
        post.location_lat !== null &&
        post.location_lng !== null
    )
    .map((post) => ({
      lat: post.location_lat!,
      lng: post.location_lng!,
      name: post.location_name || undefined,
    }));

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <SuccessNotification />
      </Suspense>
      {/* Container with responsive padding */}
      <div className="mx-auto max-w-2xl bg-background/95 p-4 pt-8 md:p-6 md:pt-10 shadow-lg backdrop-blur-sm min-h-screen">
        {/* Lighter Header - Enhanced Layout */}
        <div className="mb-8 border-b border-border pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Left: Lighter Illustration */}
            <div className="hidden md:flex items-center justify-center">
              <Image
                src="/illustrations/telling_stories.png"
                alt="Lighter illustration"
                width={100}
                height={100}
                className="w-24 h-24 object-contain"
              />
            </div>

            {/* Center: Name and PIN */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {lighter.name}
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                PIN: <span className="font-mono font-semibold text-foreground">{lighter.pin_code}</span>
              </p>
            </div>

            {/* Right: Post Count */}
            <div className="flex flex-col items-center justify-center md:items-end">
              <p className="text-5xl md:text-6xl font-bold text-primary">
                {posts?.length || 0}
              </p>
              <p className="text-lg text-muted-foreground font-medium mt-1">
                {posts?.length === 1 ? 'Post' : 'Posts'}
              </p>
            </div>
          </div>
        </div>

        {/* Map + Saved By Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Map on Left (takes 2 columns on desktop) */}
          {locationData && locationData.length > 0 && (
            <div className="md:col-span-2 rounded-lg overflow-hidden shadow-md">
              <MapComponent locations={locationData} height="300px" />
            </div>
          )}

          {/* Saved By Section on Right */}
          <div className="flex flex-col justify-start">
            <div className="rounded-lg border border-border bg-background p-6 shadow-md h-fit">
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-3">
                Lighter Saved By
              </p>
              <p className="text-2xl font-bold text-foreground">
                {saverUsername}
              </p>
              <div className="mt-6 pt-6 border-t border-border/50">
                <Link
                  href={`/${params.locale}/lighter/${lighter.id}/add`}
                  className="btn-primary block w-full text-center flex items-center justify-center gap-2 py-3"
                >
                  <PlusIcon className="h-5 w-5 text-white" />
                  <span>Add to Story</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts && posts.length > 0 ? (
            posts.map((post: DetailedPost) => (
              <PostCard key={post.id} post={post} isLoggedIn={isLoggedIn} />
            ))
          ) : (
            <EmptyLighterPosts lighterId={lighter.id} />
          )}
        </div>
      </div>
    </div>
  );
}