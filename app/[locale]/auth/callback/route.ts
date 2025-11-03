import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * Helper function to wait for profile creation with retry logic
 * Addresses race condition where auth user is created before profile trigger fires
 */
async function waitForProfile(
  supabase: any,
  userId: string,
  maxAttempts = 10,
  delayMs = 500
): Promise<{ profile: any; isNewUser: boolean }> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('created_at, username')
      .eq('id', userId)
      .single();

    if (profile) {
      // Profile exists - check if newly created
      const createdTime = new Date(profile.created_at).getTime();
      const now = Date.now();
      const isNewUser = (now - createdTime) < 10000; // Created within last 10 seconds

      return { profile, isNewUser };
    }

    // Profile doesn't exist yet - wait and retry (unless last attempt)
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  // Profile still doesn't exist after retries - create it as fallback
  console.warn(`Profile not found for user ${userId} after ${maxAttempts} attempts. Creating fallback profile.`);
  return { profile: null, isNewUser: true };
}

/**
 * Creates a profile for a user (fallback when trigger doesn't fire)
 */
async function createFallbackProfile(supabase: any, session: any): Promise<any> {
  const defaultUsername =
    session.user.user_metadata?.full_name ||
    session.user.user_metadata?.name ||
    session.user.email?.split('@')[0] ||
    `User_${session.user.id.substring(0, 8)}`;

  const { data: newProfile, error } = await supabase
    .from('profiles')
    .insert({
      id: session.user.id,
      username: defaultUsername,
      created_at: new Date().toISOString(),
    })
    .select('created_at, username')
    .single();

  if (error) {
    console.error('Failed to create fallback profile:', error);
    return null;
  }

  return newProfile;
}

export async function GET(request: NextRequest, { params }: { params: { locale: string } }) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const locale = params.locale;

  let isNewUser = false;
  let hasError = false;

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);

    try {
      // Exchange code for session
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Auth exchange error:', exchangeError);
        hasError = true;
      } else {
        // Get the session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user?.id) {
          console.error('Session error:', sessionError);
          hasError = true;
        } else {
          // Wait for profile creation with retry logic
          const { profile, isNewUser: profileIsNew } = await waitForProfile(
            supabase,
            session.user.id
          );

          isNewUser = profileIsNew;

          // If profile still doesn't exist, create it as fallback
          if (!profile) {
            const fallbackProfile = await createFallbackProfile(supabase, session);
            if (fallbackProfile) {
              isNewUser = true;
            } else {
              hasError = true;
            }
          }

          // Check and grant unlocked trophies on login/signup
          // This ensures trophies are up-to-date without running on every page load
          try {
            await supabase.rpc('grant_unlocked_trophies', { p_user_id: session.user.id });
          } catch (trophyError) {
            // Non-critical error - log but don't fail the login
            console.warn('Trophy check failed on login:', trophyError);
          }
        }
      }
    } catch (error) {
      console.error('Unexpected auth callback error:', error);
      hasError = true;
    }
  }

  // Redirect with appropriate query parameter
  if (hasError) {
    return NextResponse.redirect(`${requestUrl.origin}/${locale}/login?error=auth_failed`);
  }

  const queryParam = isNewUser ? 'signup_success=true' : 'login_success=true';
  return NextResponse.redirect(`${requestUrl.origin}/${locale}?${queryParam}`);
}
