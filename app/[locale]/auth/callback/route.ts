import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, type TypedSupabaseClient } from '@/lib/supabase-server';
import { sendWelcomeEmail } from '@/lib/email';
import { SupportedEmailLanguage } from '@/lib/email-i18n';
import { logger } from '@/lib/logger';
import type { Session } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export const dynamic = 'force-dynamic';

interface ProfileData {
  created_at: string;
  username: string | null;
  level?: number;
  points?: number;
}

async function waitForProfile(
  supabase: TypedSupabaseClient,
  userId: string,
  maxAttempts = 10,
  delayMs = 500
): Promise<{ profile: ProfileData | null; isNewUser: boolean }> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('created_at, username')
      .eq('id', userId)
      .single<{ created_at: string; username: string | null }>();

    if (profile) {
      
      const createdTime = new Date(profile.created_at).getTime();
      const now = Date.now();
      const isNewUser = (now - createdTime) < 10000; 

      return { profile, isNewUser };
    }

    
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  
  console.warn(`Profile not found for user ${userId} after ${maxAttempts} attempts. Creating fallback profile.`);
  return { profile: null, isNewUser: true };
}

async function createFallbackProfile(supabase: TypedSupabaseClient, session: Session): Promise<ProfileData | null> {
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
    })
    .select('created_at, username')
    .single<{ created_at: string; username: string | null }>();

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
      
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Auth exchange error:', exchangeError);
        hasError = true;
      } else {
        
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user?.id) {
          console.error('Session error:', sessionError);
          hasError = true;
        } else {
          
          const { profile, isNewUser: profileIsNew } = await waitForProfile(
            supabase,
            session.user.id
          );

          isNewUser = profileIsNew;

          
          if (!profile) {
            const fallbackProfile = await createFallbackProfile(supabase, session);
            if (fallbackProfile) {
              isNewUser = true;
            } else {
              hasError = true;
            }
          }



          try {
            await supabase.rpc('grant_unlocked_trophies', { p_user_id: session.user.id });
          } catch (trophyError) {

            console.warn('Trophy check failed on login:', trophyError);
          }

          // Send welcome email for new users
          if (isNewUser && session.user.email) {
            try {
              const userName =
                session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                profile?.username ||
                session.user.email.split('@')[0];

              const emailLang = (locale || 'en') as SupportedEmailLanguage;

              await sendWelcomeEmail({
                userEmail: session.user.email,
                userName,
                profileUrl: `${requestUrl.origin}/${locale}/my-profile`,
                saveLighterUrl: `${requestUrl.origin}/${locale}/save-lighter`,
                language: emailLang,
              });

              logger.event('welcome_email_sent', {
                email: session.user.email,
                userId: session.user.id,
                language: emailLang
              });
            } catch (emailError) {
              // Don't block the signup flow if email fails
              console.error('Failed to send welcome email:', emailError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Unexpected auth callback error:', error);
      hasError = true;
    }
  }

  if (hasError) {
    return NextResponse.redirect(`${requestUrl.origin}/${locale}?error=auth_failed`);
  }

  const queryParam = isNewUser ? 'signup_success=true' : 'login_success=true';
  return NextResponse.redirect(`${requestUrl.origin}/${locale}?${queryParam}`);
}
