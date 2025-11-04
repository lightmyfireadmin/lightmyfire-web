import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AddPostForm from './AddPostForm';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function AddContributionPage({
  params,
}: {
  params: { id: string; locale: string };
}) {
  const cookieStore = cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    
    redirect(`/${params.locale}/login?message=You must be logged in to add a story.`);
  }

  
  const { data: lighter } = await supabase
    .from('lighters')
    .select('name')
    .eq('id', params.id)
    .single();

  
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