import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import MyPostsList from './MyPostsList'; // <-- FIX 1: Removed .tsx
import TrophyList from './TrophyList';
// import { MyPostWithLighter } from './MyPostsList'; // <-- FIX 2: This line is removed.

export const dynamic = 'force-dynamic';

// This type is defined *here*
export type MyPostWithLighter = {
  id: number;
  title: string | null;
  post_type: string;
  created_at: string;
  lighter_id: string;
  lighters: {
    name: string;
  } | null;
};

// Define a type for our Trophies
export type Trophy = {
  id: number;
  name: string;
  description: string;
  icon_name: string | null;
};

export default async function MyProfilePage() {
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

  // 1. Check for a logged-in user
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login?message=You must be logged in to view your profile.');
  }
  const userId = session.user.id;

  // 2. Fetch all data in parallel
  const [
    profileRes,
    statsRes,
    savedLightersRes,
    myPostsRes,
    trophiesRes,
  ] = await Promise.all([
    supabase.from('profiles').select('username, level, points').eq('id', userId).single(),
    supabase.rpc('get_my_stats'),
    supabase.from('lighters').select('id, name, pin_code').eq('saver_id', userId),
    supabase
      .from('posts')
      .select('id, title, post_type, created_at, lighter_id, lighters ( name )')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('user_trophies')
      .select('trophies (*)')
      .eq('user_id', userId),
  ]);

  const profile = profileRes.data;
  const stats = statsRes.data;

  // <-- FIX 3: Use 'as unknown as' for safer type casting
  const myPosts: MyPostWithLighter[] =
    (myPostsRes.data as unknown as MyPostWithLighter[]) || [];
  
  // Extract just the trophy data
  // <-- FIX 3: Use 'as unknown as' for safer type casting
  const myTrophies: Trophy[] =
    (trophiesRes.data?.map((t) => t.trophies) as unknown as Trophy[]) || [];

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">
          @{profile?.username}
        </h1>
        <p className="mt-1 text-gray-500">
          Level {profile?.level} | {profile?.points} Points
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Contributions" value={stats?.total_contributions} />
        <StatCard label="Lighters Saved" value={stats?.lighters_saved} />
        <StatCard label="Stories Joined" value={stats?.lighters_contributed_to} />
        <StatCard label="Likes Received" value={stats?.likes_received} />
      </div>

      {/* Trophies Section */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">My Trophies</h2>
        <TrophyList trophies={myTrophies} />
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Column 1: My Saved Lighters */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:col-span-1">
          <h2 className="mb-4 text-xl font-semibold">My Saved Lighters</h2>
          <div className="space-y-3">
            {savedLightersRes.data && savedLightersRes.data.length > 0 ? (
              savedLightersRes.data.map((lighter) => (
                <Link
                  key={lighter.id}
                  href={`/lighter/${lighter.id}`}
                  className="block rounded-md border p-3 transition hover:bg-gray-50"
                >
                  <p className="font-semibold text-blue-600">{lighter.name}</p>
                  <p className="font-mono text-sm text-gray-500">
                    {lighter.pin_code}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                You haven't saved any lighters yet.
              </p>
            )}
          </div>
        </div>

        {/* Column 2: My Contributions */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:col-span-2">
          <h2 className="mb-4 text-xl font-semibold">My Contributions</h2>
          <MyPostsList initialPosts={myPosts} />
        </div>
      </div>
    </div>
  );
}

// Helper component for the stat cards
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-gray-50 p-4 shadow-inner">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}