import type { Metadata } from 'next';
import { Poppins, Nunito_Sans } from 'next/font/google';
import '../globals.css';
import { I18nProviderClient } from '@/locales/client';
import { getI18n, getCurrentLocale } from '@/locales/server';
import type { CookieOptions } from '@supabase/ssr';

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: '700',
});

const nunito_sans = Nunito_Sans({
  subsets: ['latin'],
  display: 'swap',
});

// Correct import paths assuming components folder is inside app/
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import CookieConsent from '@/app/components/CookieConsent'; // Import CookieConsent

export const metadata: Metadata = {
  title: 'LightMyFire',
  description: 'A human creativity mosaic.',
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getCurrentLocale();
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
    data: {
      session
    },
  } = await supabase.auth.getSession();

  return (
    <html lang={locale}>
      <head>
        {/* Font links are now handled by next/font */}
      </head>
      {/* Added flex classes for sticky footer and font-sans */}
      <body className={`${poppins.className} ${nunito_sans.className} flex flex-col min-h-screen body-with-bg`}>
        <I18nProviderClient locale={locale}>
          <Header session={session} />
          {/* Added flex-grow */}
          <main className="flex-grow">{children}</main>
          <Footer />
        </I18nProviderClient>
        <CookieConsent /> {/* Render CookieConsent here */}
      </body>
    </html>
  );
}