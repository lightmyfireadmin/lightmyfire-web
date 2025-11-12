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
  username: string;
  level?: number;
  points?: number;
  welcome_email_sent?: boolean;
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
      .select('created_at, username, welcome_email_sent')
      .eq('id', userId)
      .single<{ created_at: string; username: string; welcome_email_sent: boolean }>();

    if (profile) {
      // User is new if they haven't received a welcome email yet
      const isNewUser = !profile.welcome_email_sent;

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
  const defaultUsername: string =
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
    .single<{ created_at: string; username: string }>();

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

          console.log('Auth callback - user status:', {
            userId: session.user.id,
            email: session.user.email,
            isNewUser,
            profileFound: !!profile,
            welcomeEmailSent: profile?.welcome_email_sent,
            provider: session.user.app_metadata?.provider,
          });

          
          if (!profile) {
            const fallbackProfile = await createFallbackProfile(supabase, session);
            if (fallbackProfile) {
              isNewUser = true;
            } else {
              hasError = true;
            }
          }



          try {
            await supabase.rpc('auto_grant_trophies', { user_id_param: session.user.id });
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

              console.log('Sending welcome email to new user:', {
                email: session.user.email,
                userName,
                userId: session.user.id,
                isGoogleAuth: session.user.app_metadata?.provider === 'google',
              });

              const emailResult = await sendWelcomeEmail({
                userEmail: session.user.email,
                userName,
                profileUrl: `${requestUrl.origin}/${locale}/my-profile`,
                saveLighterUrl: `${requestUrl.origin}/${locale}/save-lighter`,
                language: emailLang,
              });

              if (emailResult.success) {
                console.log('Welcome email sent successfully:', {
                  email: session.user.email,
                  emailId: emailResult.id,
                });
                logger.event('welcome_email_sent', {
                  email: session.user.email,
                  userId: session.user.id,
                  language: emailLang,
                  emailId: emailResult.id,
                });

                // Mark welcome email as sent in database
                await supabase
                  .from('profiles')
                  .update({ welcome_email_sent: true })
                  .eq('id', session.user.id);
              } else {
                console.error('Welcome email failed to send:', {
                  email: session.user.email,
                  error: emailResult.error,
                });
                logger.event('welcome_email_failed', {
                  email: session.user.email,
                  userId: session.user.id,
                  error: emailResult.error,
                });
              }
            } catch (emailError) {
              // Don't block the signup flow if email fails
              console.error('Failed to send welcome email (exception):', {
                error: emailError,
                email: session.user.email,
                userId: session.user.id,
              });
              logger.event('welcome_email_error', {
                email: session.user.email,
                userId: session.user.id,
                error: emailError instanceof Error ? emailError.message : 'Unknown error',
              });
            }
          } else if (!isNewUser && session.user.email) {
            console.log('Existing user logged in, skipping welcome email:', {
              email: session.user.email,
              userId: session.user.id,
            });
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
