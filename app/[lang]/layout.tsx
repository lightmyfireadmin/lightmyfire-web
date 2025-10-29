import type { Metadata } from 'next';
import { Poppins, Nunito_Sans } from 'next/font/google';
// Nous importons le CSS global ici car c'est le layout racine
import '../globals.css';
import { I18nProviderClient } from '@/locales/client';
import type { CookieOptions } from '@supabase/ssr';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import CookieConsent from '@/app/components/CookieConsent';

// Configuration des polices
const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: '700',
  variable: '--font-poppins',
});

const nunito_sans = Nunito_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700'],
  variable: '--font-nunito-sans',
});

// Métadonnées
export const metadata: Metadata = {
  title: 'LightMyFire',
  description: 'A human creativity mosaic.',
};

export const dynamic = 'force-dynamic';

// Ceci est le RootLayout (Layout Racine)
export default async function RootLayout({
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

  // Le layout racine DOIT contenir <html> et <body>
  return (
    <html lang={locale} className={`${poppins.variable} ${nunito_sans.variable}`}>
      <head>
        {/* Les liens de polices sont gérés par next/font */}
      </head>
      <body className="flex flex-col min-h-screen body-with-bg font-sans">
        <I18nProviderClient locale={locale}>
          <Header session={session} />
          <main className="flex-grow">{children}</main>
          <Footer lang={locale} />

          {/*
            CORRECTION : Le CookieConsent est déplacé
            À L'INTÉRIEUR du I18nProviderClient
            pour que le composant <Link> reçoive la locale.
          */}
          <CookieConsent />
        </I18nProviderClient>
      </body>
    </html>
  );
}
