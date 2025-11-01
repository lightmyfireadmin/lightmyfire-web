import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AddPostForm from './AddPostForm';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// This page gets the 'id' from the URL (e.g., /lighter/[id]/add)
export default async function AddContributionPage({
  params,
}: {
  params: { id: string; locale: string };
}) {
  const cookieStore = cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  // 1. Check for a logged-in user
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // If not logged in, redirect to login
    redirect(`/${params.locale}/login?message=You must be logged in to add a story.`);
  }

  // 2. Fetch the lighter's name to show on the page
  const { data: lighter } = await supabase
    .from('lighters')
    .select('name')
    .eq('id', params.id)
    .single();

  // 3. Render the form, passing the user and lighter ID
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AddPostForm
        user={session.user}
        lighterId={params.id}
        lighterName={lighter?.name || 'this lighter'}
      />
    </div>
  );
}