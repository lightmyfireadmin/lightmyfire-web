import { I18nProviderClient } from '@/locales/client';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ToastWrapper from '@/app/components/ToastWrapper';
import WelcomeBanner from '@/app/components/WelcomeBanner';
import { cookies } from 'next/headers';
import CookieConsent from '@/app/components/CookieConsent';
import React from 'react';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function LangLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const cookieStore = cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  
  let username: string | null = null;
  if (session?.user?.id) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', session.user.id)
      .single<{ username: string | null }>();
    username = profileData?.username || null;
  }

  
  
  return (

    <I18nProviderClient locale={locale}>
      <ToastWrapper>
        {}
        <Header session={session} username={username} />
        <WelcomeBanner isLoggedIn={session !== null} username={username} />
        <main className="flex-grow">{children}</main>
        <Footer lang={locale} />
        <CookieConsent />
      </ToastWrapper>
    </I18nProviderClient>
  );
}
