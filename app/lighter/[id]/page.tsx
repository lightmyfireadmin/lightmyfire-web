import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
// Assuming PostCard is inside app/components/
import PostCard from '@/app/components/PostCard';
import { DetailedPost } from '@/lib/types'; // Assuming lib is at root
import type { Metadata } from 'next';

// --- generateMetadata Function (Remains the same) ---
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
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
      className="min-h-screen bg-background"
      style={{
        backgroundImage: lighter.custom_background_url
          ? `url(${lighter.custom_background_url})`
          : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Container with responsive padding */}
      <div className="mx-auto max-w-2xl bg-background/95 p-4 pt-8 md:p-6 md:pt-10 shadow-lg backdrop-blur-sm min-h-screen"> {/* Adjusted padding */}
        {/* Lighter Header */}
        <div className="mb-8 border-b border-border pb-6">
          {/* Responsive heading size */}
          <h1 className="text-center text-3xl md:text-4xl font-bold text-foreground"> {/* Adjusted heading size */}
            {lighter.name}
          </h1>
          <p className="mt-2 text-center text-lg text-muted-foreground">
            PIN: <span className="font-mono font-semibold text-foreground">{lighter.pin_code}</span>
          </p>
        </div>

        {/* Add to Story Button */}
        <div className="mb-8">
          <Link
            href={`/lighter/${lighter.id}/add`}
            className="btn-primary block w-full text-lg text-center" // Button style applied
          >
            Add to the Story
          </Link>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts && posts.length > 0 ? (
            posts.map((post: DetailedPost) => (
              <PostCard key={post.id} post={post} isLoggedIn={isLoggedIn} />
            ))
          ) : (
            <p className="text-center text-muted-foreground">
              This lighter&apos;s story is just beginning. Be the first to add to it!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}