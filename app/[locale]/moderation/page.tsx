import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DetailedPost } from '@/lib/types';
import ModerationQueue from './ModerationQueue';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getCurrentLocale } from '@/locales/server';

export const dynamic = 'force-dynamic';

export default async function ModerationPage() {
  const locale = await getCurrentLocale();
  const cookieStore = cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/${locale}/login?message=You must be logged in to access this page.`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single<{ role: 'admin' | 'moderator' | 'user' | null }>();

    if (profile?.role !== 'moderator' && profile?.role !== 'admin') {
    redirect(`/${locale}?message=You do not have permission to access this page.`);
  }

    const { data: flaggedPosts, error } = await supabase
    .from('detailed_posts')
    .select('*')
    .eq('requires_review', true)      .order('created_at', { ascending: false});

  if (error) {
    return <p className="text-center text-error">Error loading posts for review.</p>;
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <h1 className="mb-2 text-center text-3xl font-bold text-foreground">🛡️ Moderation Queue</h1>
      <p className="mb-6 text-center text-muted-foreground">
        Posts requiring manual review (flagged by community, API, or moderation system failure).
      </p>

      {flaggedPosts && flaggedPosts.length > 0 ? (
        <ModerationQueue initialPosts={flaggedPosts} />
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-2">✓ No posts in queue</p>
          <p className="text-sm text-muted-foreground">
            The moderation queue is clean. All posts requiring review have been processed.
          </p>
        </div>
      )}
    </div>
  );
}
