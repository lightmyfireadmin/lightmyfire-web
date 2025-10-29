// CE FICHIER EST app/[lang]/layout.tsx
// Il ne doit PAS contenir <html>, <body>, ou les imports de police/globals.css

import { I18nProviderClient } from '@/locales/client';
import type { CookieOptions } from '@supabase/ssr';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import CookieConsent from '@/app/components/CookieConsent';

// Les polices et metadata sont dans le layout racine (app/layout.tsx)

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

  // Ce layout est un enfant, il ne retourne que ce qu'il contient.
  // La classe "flex" est déplacée sur le <body> du VRAI root layout.
  return (
    <I18nProviderClient locale={locale}>
      {/* Le Header, le Footer et le CookieConsent sont ici 
        pour avoir accès à la 'locale' du provider.
      */}
      <Header session={session} />
      <main className="flex-grow">{children}</main>
      <Footer lang={locale} />
      <CookieConsent />
    </I18nProviderClient>
  );
}

