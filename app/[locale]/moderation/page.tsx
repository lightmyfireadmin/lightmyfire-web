import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DetailedPost } from '@/lib/types';
import ModerationQueue from './ModerationQueue';

export const dynamic = 'force-dynamic';

export default async function ModerationPage() {
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

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login?message=You must be logged in to access this page.');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profile?.role !== 'moderator') {
    redirect('/?message=You do not have permission to access this page.');
  }

  // Fetch flagged posts
  const { data: flaggedPosts, error } = await supabase
    .from('detailed_posts') // Assuming detailed_posts view includes is_flagged
    .select('*')
    .eq('is_flagged', true)
    .order('created_at', { ascending: false });

  if (error) {
    return <p className="text-center text-error">Error loading flagged posts.</p>;
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <h1 className="mb-2 text-center text-3xl font-bold text-foreground">🛡️ Moderation Queue</h1>
      <p className="mb-6 text-center text-muted-foreground">
        Posts that have been flagged by the community for review.
      </p>

      {flaggedPosts && flaggedPosts.length > 0 ? (
        <ModerationQueue initialPosts={flaggedPosts} />
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-2">✓ No posts in queue</p>
          <p className="text-sm text-muted-foreground">
            The moderation queue is clean. All flagged posts have been reviewed.
          </p>
        </div>
      )}
    </div>
  );
}
