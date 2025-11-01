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

  // Fetch username if user is logged in
  let username: string | null = null;
  if (session?.user?.id) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', session.user.id)
      .single();
    username = profileData?.username || null;
  }

  // This layout provides the language context and the main UI shell
  // (Header, Footer) INSIDE the root <body> tag.
  return (

    <I18nProviderClient locale={locale}>
      <ToastWrapper>
        {/*
          The flex column structure is now on the <body> tag in the root layout.
          This component just renders its children in order.
        */}
        <Header session={session} username={username} />
        <WelcomeBanner isLoggedIn={session !== null} username={username} />
        <main className="flex-grow">{children}</main>
        <Footer lang={locale} />
        <CookieConsent />
      </ToastWrapper>
    </I18nProviderClient>
  );
}
