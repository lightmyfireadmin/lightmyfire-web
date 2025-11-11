import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import MyPostsList from './MyPostsList';
import TrophyList from './TrophyList';
import EditProfileForm from './EditProfileForm';
import UpdateAuthForm from './UpdateAuthForm';
import ProfileHeader from './ProfileHeader';

import type { MyPostWithLighter, Trophy } from '@/lib/types';
import Image from 'next/image';
import { getI18n, getCurrentLocale } from '@/locales/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

interface SavedLighter {
  id: string;
  name: string;
  pin_code: string;
}

interface UserTrophyRecord {
  trophies: Trophy;
}

export const dynamic = 'force-dynamic';
export const revalidate = 60; 
function calculateLevel(points: number): number {
  
  
  
  
  
  

  if (points < 50) return 1;

  
  
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

function getPointsForNextLevel(currentLevel: number): number {
  if (currentLevel >= 100) return Infinity;
  
  return Math.floor(Math.pow(currentLevel + 1, 1.3) * 50);
}

function getTotalPointsForLevel(level: number): number {
  if (level <= 1) return 0;

  let total = 50; 
  for (let i = 2; i <= level; i++) {
    total += Math.floor(Math.pow(i, 1.3) * 50);
  }
  return total;
}

function calculatePoints(stats: {
  total_contributions: number;
  lighters_saved: number;
  lighters_contributed_to: number;
  likes_received: number;
}): number {
  
  
  
  
  
  return (
    (stats.total_contributions ?? 0) * 10 +
    (stats.lighters_saved ?? 0) * 50 +
    (stats.lighters_contributed_to ?? 0) * 20 +
    (stats.likes_received ?? 0) * 5
  );
}

export default async function MyProfilePage() {
  const t = await getI18n() as any;
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
      .select('id, title, post_type, created_at, lighter_id, lighters ( name )') 
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('user_trophies')
      .select('trophies (*)') 
      .eq('user_id', userId),
  ]);

  let profile = profileRes.data;

  
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

  const calculatedPoints = calculatePoints(stats);
  const calculatedLevel = calculateLevel(calculatedPoints);

      const shouldUpdate = profile && (
    profile.level !== calculatedLevel ||
    Math.abs((profile.points ?? 0) - calculatedPoints) >= 10
  );

  if (shouldUpdate) {
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .update({
        level: calculatedLevel,
        points: calculatedPoints,
      })
      .eq('id', userId)
      .select('level, points')
      .single();

    if (updatedProfile && profile) {
      profile.level = updatedProfile.level;
      profile.points = updatedProfile.points;
    }
  } else if (profile) {
        profile.level = calculatedLevel;
    profile.points = calculatedPoints;
  }

  
  const myPosts: MyPostWithLighter[] =
    (myPostsRes.data as unknown as MyPostWithLighter[]) || [];

  
  const myTrophies: Trophy[] =
    ((trophiesRes.data as UserTrophyRecord[] | null)?.map((t) => t.trophies).filter(Boolean) as Trophy[]) || [];

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      {}
      {profile && (
        <ProfileHeader
          username={profile.username}
          level={profile.level}
          points={profile.points}
          role={profile.role}
        />
      )}

      {}
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label={t('my_profile.stats.contributions')} value={stats.total_contributions} icon="📝" />
        <StatCard label={t('my_profile.stats.lighters_saved')} value={stats.lighters_saved} icon="🔥" />
        <StatCard label={t('my_profile.stats.stories_joined')} value={stats.lighters_contributed_to} icon="📖" />
        <StatCard label={t('my_profile.stats.likes_received')} value={stats.likes_received} icon="❤️" />
      </div>
      {}
      <div className="mb-8 rounded-lg border border-border bg-background p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-foreground">{t('my_profile.tabs.my_trophies')}</h2>
        <TrophyList trophies={myTrophies} />
      </div>

      {}
      <div className="mb-8 rounded-lg border border-border bg-background p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-foreground">{t('my_profile.tabs.my_posts')}</h2>
        <MyPostsList initialPosts={myPosts} />
      </div>

      {}
      <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
        {}
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-foreground">{t('my_profile.saved_lighters')}</h2>
          {savedLightersRes.data && savedLightersRes.data.length > 0 ? (
            <ul className="space-y-2">
              {(savedLightersRes.data as SavedLighter[]).map((lighter) => (
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

        {}
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold text-foreground">{t('my_profile.edit_profile')}</h2>
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

        {}
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-foreground">{t('my_profile.security')}</h2>
          <UpdateAuthForm />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon?: string }) {
  
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
