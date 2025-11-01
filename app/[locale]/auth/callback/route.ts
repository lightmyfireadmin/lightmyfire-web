import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { locale: string } }) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const locale = params.locale;

  let isNewUser = false;

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    await supabase.auth.exchangeCodeForSession(code);

    // Check if this is a new user by checking if profile was created very recently
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user?.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', session.user.id)
        .single();

      if (profile?.created_at) {
        // Check if profile was created within the last 10 seconds (likely a new signup)
        const createdTime = new Date(profile.created_at).getTime();
        const now = Date.now();
        if (now - createdTime < 10000) {
          isNewUser = true;
        }
      }
    }
  }

  const queryParam = isNewUser ? 'signup_success=true' : 'login_success=true';
  return NextResponse.redirect(`${requestUrl.origin}/${locale}?${queryParam}`);
}