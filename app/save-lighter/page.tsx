import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SaveLighterForm from './SaveLighterForm'; // Import our new form

export const dynamic = 'force-dynamic';

export default async function SaveLighterPage() {
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
    redirect('/login?message=You must be logged in to save a lighter');
  }

  // We found a session! Pass the user to the form.
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <SaveLighterForm user={session.user} />
    </div>
  );
}