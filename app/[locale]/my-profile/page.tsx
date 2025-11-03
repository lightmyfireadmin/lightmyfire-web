import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
// Import components from the same directory
import MyPostsList from './MyPostsList';
import TrophyList from './TrophyList';
import EditProfileForm from './EditProfileForm';
import UpdateAuthForm from './UpdateAuthForm';
import ProfileHeader from './ProfileHeader';
// Corrected: Import types from the central lib/types.ts file
import type { MyPostWithLighter, Trophy } from '@/lib/types';
import Image from 'next/image'; // Import Image component
import { getI18n, getCurrentLocale } from '@/locales/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// Helper function to calculate level from points (1-100 levels)
// Easier progression to encourage gamification
function calculateLevel(points: number): number {
  // 100 levels with exponential but gentle progression
  // Level 1: 0-49 points
  // Level 2: 50-149 points
  // Level 3: 150-299 points
  // ... each level requires progressively more points
  // Level 100: ~50,000+ points (equivalent to old level 5/6)

  if (points < 50) return 1;

  // For levels 2-100: quadratic progression
  // Points needed = level^1.3 * 50
  let level = 1;
  let cumulativePoints = 0;

  for (let i = 2; i <= 100; i++) {
    const pointsForThisLevel = Math.floor(Math.pow(i, 1.3) * 50);
    cumulativePoints += pointsForThisLevel;
    if (points < cumulativePoints) {
      return i - 1;
    }
  }

  return 100;
}

// Helper function to get points needed for next level
function getPointsForNextLevel(currentLevel: number): number {
  if (currentLevel >= 100) return Infinity;
  // Points needed for the next level
  return Math.floor(Math.pow(currentLevel + 1, 1.3) * 50);
}

// Helper function to get total cumulative points needed to reach a level
function getTotalPointsForLevel(level: number): number {
  if (level <= 1) return 0;

  let total = 50; // Points for level 1
  for (let i = 2; i <= level; i++) {
    total += Math.floor(Math.pow(i, 1.3) * 50);
  }
  return total;
}

// Helper function to calculate points from contributions
function calculatePoints(stats: {
  total_contributions: number;
  lighters_saved: number;
  lighters_contributed_to: number;
  likes_received: number;
}): number {
  // Points breakdown:
  // - Each post/contribution: 10 points
  // - Each lighter saved: 50 points
  // - Each lighter contributed to: 20 points
  // - Each like received: 5 points
  return (
    (stats.total_contributions ?? 0) * 10 +
    (stats.lighters_saved ?? 0) * 50 +
    (stats.lighters_contributed_to ?? 0) * 20 +
    (stats.likes_received ?? 0) * 5
  );
}

export default async function MyProfilePage() {
  const t = await getI18n();
  const locale = await getCurrentLocale();

  const cookieStore = cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/${locale}/login?message=You must be logged in to view your profile.`);
  }
  const userId = session.user.id;

  // Refresh trophies before fetching data
  await supabase.rpc('grant_unlocked_trophies', { p_user_id: userId });

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

  let profile = profileRes.data;

  // If profile doesn't exist (e.g., Google user), create one
  if (!profile && session?.user?.id) {
    const defaultUsername = session.user.user_metadata?.full_name ||
                           session.user.email?.split('@')[0] ||
                           `User_${session.user.id.substring(0, 8)}`;

    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: session.user.id,
        username: defaultUsername,
        created_at: new Date().toISOString(),
      })
      .select('username, level, points, nationality, show_nationality, role')
      .single();

    if (!createError && newProfile) {
      profile = newProfile;
    }
  }

  const stats = {
      total_contributions: statsRes.data?.total_contributions ?? 0,
      lighters_saved: statsRes.data?.lighters_saved ?? 0,
      lighters_contributed_to: statsRes.data?.lighters_contributed_to ?? 0,
      likes_received: statsRes.data?.likes_received ?? 0,
  };

  // Calculate points and level based on stats
  const calculatedPoints = calculatePoints(stats);
  const calculatedLevel = calculateLevel(calculatedPoints);

  // Update profile's level and points if they've changed
  if (profile && (profile.level !== calculatedLevel || profile.points !== calculatedPoints)) {
    await supabase
      .from('profiles')
      .update({
        level: calculatedLevel,
        points: calculatedPoints,
      })
      .eq('id', userId);

    // Update the profile object for display
    profile.level = calculatedLevel;
    profile.points = calculatedPoints;
  }

  // Cast fetched post data using the imported type
  const myPosts: MyPostWithLighter[] =
    (myPostsRes.data as unknown as MyPostWithLighter[]) || [];

  // Extract nested trophy data and cast using the imported type
  const myTrophies: Trophy[] =
    (trophiesRes.data?.map((t: any) => t.trophies).filter(Boolean) as unknown as Trophy[]) || [];


  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      {/* Header section */}
      {profile && (
        <ProfileHeader
          username={profile.username}
          level={profile.level}
          points={profile.points}
          role={profile.role}
        />
      )}

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Contributions" value={stats.total_contributions} icon="📝" />
        <StatCard label="Lighters Saved" value={stats.lighters_saved} icon="🔥" />
        <StatCard label="Stories Joined" value={stats.lighters_contributed_to} icon="📖" />
        <StatCard label="Likes Received" value={stats.likes_received} icon="❤️" />
      </div>
      {/* Trophies Section */}
      <div className="mb-8 rounded-lg border border-border bg-background p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-foreground">My Trophies</h2>
        <TrophyList trophies={myTrophies} />
      </div>

      {/* My Posts Section */}
      <div className="mb-8 rounded-lg border border-border bg-background p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-foreground">My Posts</h2>
        <MyPostsList initialPosts={myPosts} />
      </div>

      {/* Saved Lighters + Contributions Grid */}
      <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Saved Lighters Section */}
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Saved Lighters</h2>
          {savedLightersRes.data && savedLightersRes.data.length > 0 ? (
            <ul className="space-y-2">
              {savedLightersRes.data.map((lighter: any) => (
                <li key={lighter.id}>
                  <Link
                    href={`/${locale}/lighter/${lighter.id}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {lighter.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">PIN: {lighter.pin_code}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">{t('my_profile.no_lighters_saved')}</p>
          )}
        </div>

        {/* Edit Profile Section */}
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold text-foreground">Edit Profile</h2>
            <div className="h-16 w-16 flex-shrink-0">
              <Image
                src="/illustrations/personalise.png"
                alt="Personalise"
                width={64}
                height={64}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          {profile && <EditProfileForm user={session.user} profile={profile} />}
        </div>

        {/* Update Auth Section */}
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Security</h2>
          <UpdateAuthForm />
        </div>
      </div>
    </div>
  );
}

// StatCard helper component
function StatCard({ label, value, icon }: { label: string; value: number; icon?: string }) {
  // Determine responsive font size based on value length
  const valueStr = (value ?? 0).toString();
  const isTwoDigits = valueStr.length <= 2;
  const isThreeDigits = valueStr.length === 3;

  return (
    <div className="rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4 shadow-md hover:shadow-lg hover:border-primary/40 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        {icon && <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform">{icon}</span>}
      </div>
      <p className={`${
        isTwoDigits ? 'text-3xl sm:text-4xl' :
        isThreeDigits ? 'text-2xl sm:text-3xl' :
        'text-xl sm:text-2xl'
      } font-bold text-primary line-clamp-1`}>{value ?? 0}</p>
      <div className="mt-2 h-1 w-full bg-primary/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
          style={{ width: `${Math.min((value ?? 0) * 10, 100)}%` }}
        />
      </div>
    </div>
  );
}
