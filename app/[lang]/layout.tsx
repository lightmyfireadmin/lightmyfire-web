import { I18nProviderClient } from '@/locales/client';
import type { CookieOptions } from '@supabase/ssr';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import CookieConsent from '@/app/components/CookieConsent';

export const dynamic = 'force-dynamic';

export default async function LangLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: string };
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

    <I18nProviderClient locale={lang}>
      {/*
        The flex column structure is now on the <body> tag in the root layout.
        This component just renders its children in order.
      */}
      <Header session={session} />
      <main className="flex-grow">{children}</main>
      <Footer lang={lang} />
      <CookieConsent />
    </I18nProviderClient>
  );
}
