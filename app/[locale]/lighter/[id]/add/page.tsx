import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// We'll create this form component next
import AddPostForm from './AddPostForm'; 

export const dynamic = 'force-dynamic';

// This page gets the 'id' from the URL (e.g., /lighter/[id]/add)
export default async function AddContributionPage({
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

  // 1. Check for a logged-in user
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // If not logged in, redirect to login
    redirect('/login?message=You must be logged in to add a story.');
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