import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DetailedPost } from '@/lib/types';

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
    console.error('Error fetching flagged posts:', error);
    return <p className="text-center text-error">Error loading flagged posts.</p>;
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <h1 className="mb-6 text-center text-3xl font-bold text-foreground">Moderation Queue</h1>
      <p className="mb-4 text-muted-foreground">Posts that have been flagged for review.</p>

      <div className="space-y-4">
        {flaggedPosts && flaggedPosts.length > 0 ? (
          flaggedPosts.map((post: DetailedPost) => (
            <div key={post.id} className="border border-border rounded-lg p-4 shadow-sm">
              <p className="font-semibold">Post ID: {post.id}</p>
              <p>Lighter ID: {post.lighter_id}</p>
              <p>User: {post.username}</p>
              <p>Type: {post.post_type}</p>
              <p>Title: {post.title}</p>
              <p>Content: {post.content_text || post.content_url || post.location_name}</p>
              <div className="mt-4 flex gap-2">
                <button className="btn-primary">Reinstate</button>
                <button className="btn-secondary">Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground">No posts currently in the moderation queue.</p>
        )}
      </div>
    </div>
  );
}
