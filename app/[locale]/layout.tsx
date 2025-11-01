import { I18nProviderClient } from '@/locales/client';
import type { CookieOptions } from '@supabase/ssr';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ToastWrapper from '@/app/components/ToastWrapper';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import CookieConsent from '@/app/components/CookieConsent';
import React from 'react';

export const dynamic = 'force-dynamic';

export default async function LangLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
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
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // This layout provides the language context and the main UI shell
  // (Header, Footer) INSIDE the root <body> tag.
  return (

    <I18nProviderClient locale={locale}>
      <ToastWrapper>
        {/*
          The flex column structure is now on the <body> tag in the root layout.
          This component just renders its children in order.
        */}
        <Header session={session} />
        <main className="flex-grow">{children}</main>
        <Footer lang={locale} />
        <CookieConsent />
      </ToastWrapper>
    </I18nProviderClient>
  );
}
