// Les imports de polices, de metadata et de globals.css
// doivent être dans app/layout.tsx (le layout principal).
// Nous les retirons d'ici.
import { I18nProviderClient } from '@/locales/client';
import type { CookieOptions } from '@supabase/ssr';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import CookieConsent from '@/app/components/CookieConsent';

// Les définitions de polices (Poppins, Nunito_Sans) et
// les métadonnées (metadata) doivent être dans app/layout.tsx.

export const dynamic = 'force-dynamic';

// Renommé de RootLayout à LangLayout pour plus de clarté
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

  // Ce layout ne doit PAS contenir <html>, <head> ou <body>.
  // Il retourne directement les composants et les enfants.
  // Nous enveloppons tout dans un <I18nProviderClient> et une <div>
  // qui reprend les styles de votre <body> original pour garder la mise en page.
  return (
    <I18nProviderClient locale={locale}>
      {/* Cette div reprend les classes CSS de votre <body>
        pour maintenir la structure visuelle (flex, min-h-screen, etc.)
        La classe font-sans devrait être héritée de app/layout.tsx
      */}
      <div className="flex flex-col min-h-screen body-with-bg font-sans">
        <Header session={session} />
        <main className="flex-grow">{children}</main>
        <Footer lang={locale} />
        <CookieConsent />
      </div>
    </I18nProviderClient>
  );
}
