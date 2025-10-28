import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PostCard from '@/app/components/PostCard';
import { DetailedPost } from '@/lib/types';
import type { Metadata } from 'next'; // <-- 1. IMPORT METADATA TYPE

// --- 2. ADD THIS NEW FUNCTION ---
// This function dynamically generates metadata for each lighter page
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  // We must create a new client here because this runs separately
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

  // Fetch the lighter's details
  const { data: lighter } = await supabase
    .from('lighters')
    .select('name, custom_background_url')
    .eq('id', params.id)
    .single();

  if (!lighter) {
    // Return default metadata if lighter isn't found
    return {
      title: 'Lighter Not Found | LightMyFire',
      description: 'A human creativity mosaic.',
    };
  }

  // Return the dynamic metadata
  return {
    title: `${lighter.name} | LightMyFire`,
    description: `See the story of a lighter named "${lighter.name}". Add your own chapter to its journey!`,
    // This is the OpenGraph data
    openGraph: {
      title: lighter.name,
      description: 'See its story on LightMyFire',
      // Use the lighter's custom background as the preview image!
      images: [
        {
          url: lighter.custom_background_url || '/default-og-image.png', // We'll need to create a default image
          width: 1200,
          height: 630,
        },
      ],
      type: 'website',
    },
    // This is for X (Twitter) cards
    twitter: {
      card: 'summary_large_image',
      title: lighter.name,
      description: 'See its story on LightMyFire',
      images: [lighter.custom_background_url || '/default-og-image.png'],
    },
  };
}
// --- END OF NEW FUNCTION ---

// The rest of your page component is unchanged
export default async function LighterPage({
  params,
}: {
  params: { id: string };
}) {
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

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const isLoggedIn = session !== null;

  const { data: lighter } = await supabase
    .from('lighters')
    .select('id, name, pin_code, custom_background_url')
    .eq('id', params.id)
    .single();

  if (!lighter) {
    notFound();
  }

  const { data: posts } = await supabase
    .from('detailed_posts')
    .select('*')
    .eq('lighter_id', params.id)
    .order('created_at', { ascending: false });

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        backgroundImage: lighter.custom_background_url
          ? `url(${lighter.custom_background_url})`
          : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="mx-auto max-w-2xl bg-white/90 p-6 pt-10 shadow-lg backdrop-blur-sm">
        <div className="mb-8 border-b border-gray-300 pb-6">
          <h1 className="text-center text-4xl font-bold text-gray-800">
            {lighter.name}
          </h1>
          <p className="mt-2 text-center text-lg text-gray-500">
            PIN: <span className="font-mono font-bold">{lighter.pin_code}</span>
          </p>
        </div>

        <div className="mb-8">
          <Link
            href={`/lighter/${lighter.id}/add`}
            className="block w-full rounded-md bg-blue-600 py-3 text-center text-lg font-semibold text-white transition hover:bg-blue-700"
          >
            Add to the Story
          </Link>
        </div>

        <div className="space-y-6">
          {posts && posts.length > 0 ? (
            posts.map((post: DetailedPost) => (
              <PostCard key={post.id} post={post} isLoggedIn={isLoggedIn} />
            ))
          ) : (
            <p className="text-center text-gray-500">
              This lighter's story is just beginning. Be the first to add to it!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}