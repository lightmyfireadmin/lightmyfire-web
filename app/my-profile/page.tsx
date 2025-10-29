import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
// Import components from the same directory
import MyPostsList from './MyPostsList';
import TrophyList from './TrophyList';
import EditProfileForm from './EditProfileForm';
import UpdateAuthForm from './UpdateAuthForm';
// Corrected: Import types from the central lib/types.ts file
import type { MyPostWithLighter, Trophy } from '@/lib/types';
import Image from 'next/image'; // Import Image component

export const dynamic = 'force-dynamic';

// Removed local type definitions for MyPostWithLighter and Trophy

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

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login?message=You must be logged in to view your profile.');
  }
  const userId = session.user.id;

  // Fetch data
  const [
    profileRes,
    statsRes,
    savedLightersRes,
    myPostsRes,
    trophiesRes,
  ] = await Promise.all([
    supabase.from('profiles').select('username, level, points, nationality, show_nationality, role').eq('id', userId).single(),
    supabase.rpc('get_my_stats'),
    supabase.from('lighters').select('id, name, pin_code').eq('saver_id', userId),
    supabase
      .from('posts')
      .select('id, title, post_type, created_at, lighter_id, lighters ( name )') // Fetch lighter name via join
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('user_trophies')
      .select('trophies (*)') // Select all columns from the joined 'trophies' table
      .eq('user_id', userId),
  ]);

  const profile = profileRes.data;
  const stats = {
      total_contributions: statsRes.data?.total_contributions ?? 0,
      lighters_saved: statsRes.data?.lighters_saved ?? 0,
      lighters_contributed_to: statsRes.data?.lighters_contributed_to ?? 0,
      likes_received: statsRes.data?.likes_received ?? 0,
  };

  // Cast fetched post data using the imported type
  const myPosts: MyPostWithLighter[] =
    (myPostsRes.data as unknown as MyPostWithLighter[]) || [];

  // Extract nested trophy data and cast using the imported type
  const myTrophies: Trophy[] =
    (trophiesRes.data?.map((t: any) => t.trophies).filter(Boolean) as unknown as Trophy[]) || [];


  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      {/* Header section */}
      <div className="mb-8 rounded-lg border border-border bg-background p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-foreground">
          @{profile?.username}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Level {profile?.level ?? 1} | {profile?.points ?? 0} Points
        </p>
        {profile?.role === 'moderator' && (
          <Link href="/moderation" className="btn-primary mt-4 inline-block">
            Go to Moderation
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Contributions" value={stats.total_contributions} />
        <StatCard label="Lighters Saved" value={stats.lighters_saved} />
        <StatCard label="Stories Joined" value={stats.lighters_contributed_to} />
        <StatCard label="Likes Received" value={stats.likes_received} />
      </div>

      {/* Trophies Section */}
      <div className="mb-8 rounded-lg border border-border bg-background p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-foreground">My Trophies</h2>
        <TrophyList trophies={myTrophies} />
      </div>

      {/* Edit Profile Section */}
      <div className="mb-8 rounded-lg border border-border bg-background p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Edit Profile</h2>
          <Image
            src="/illustrations/personalise.png"
            alt="Personalise"
            width={40}
            height={40}
          />
        </div>
        {profile && <EditProfileForm user={session.user} profile={profile} />}
      </div>

      {/* Update Auth Section */}
      <div className="mb-8 rounded-lg border border-border bg-background p-6 shadow-sm">
        <UpdateAuthForm />
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Saved Lighters Column */}
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm md:col-span-1">
          <h2 className="mb-4 text-xl font-semibold text-foreground">My Saved Lighters</h2>
          <div className="space-y-3">
            {savedLightersRes.data && savedLightersRes.data.length > 0 ? (
              savedLightersRes.data.map((lighter) => (
                <Link
                  key={lighter.id}
                  href={`/lighter/${lighter.id}`}
                  className="block rounded-lg border border-border p-3 transition hover:bg-muted"
                >
                  <p className="font-semibold text-primary">{lighter.name}</p>
                  <p className="font-mono text-sm text-muted-foreground">
                    {lighter.pin_code}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                You haven&apos;t saved any lighters yet.
              </p>
            )}
          </div>
        </div>

        {/* Contributions Column */}
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm md:col-span-2">
          <h2 className="mb-4 text-xl font-semibold text-foreground">My Contributions</h2>
          {/* Pass the correctly typed posts */}
          <MyPostsList initialPosts={myPosts} />
        </div>
      </div>
    </div>
  );
}

// StatCard helper component
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold text-foreground">{value ?? 0}</p>
    </div>
  );
}