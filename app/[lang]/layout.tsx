import type { Metadata } from 'next';
import { Poppins, Nunito_Sans } from 'next/font/google';
import '../globals.css';
import { I18nProviderClient } from '@/locales/client';
import type { CookieOptions } from '@supabase/ssr';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import CookieConsent from '@/app/components/CookieConsent';

// Correct font setup using CSS variables
const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: '700',
  variable: '--font-poppins', // Define CSS variable for display font
});

const nunito_sans = Nunito_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700'], // FIX: Add required weights to fix font build error
  variable: '--font-nunito-sans', // Define CSS variable for sans-serif font
});

export const metadata: Metadata = {
  title: 'LightMyFire',
  description: 'A human creativity mosaic.',
};

export const dynamic = 'force-dynamic';

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

  return (
    // Apply font variables to the html tag for Tailwind to use
    <html lang={locale} className={`${poppins.variable} ${nunito_sans.variable}`}>
      <head>
        {/* Font links are now handled by next/font */}
      </head>
      {/* 
        The `font-sans` class from globals.css will now use the CSS variable.
        Ensure your tailwind.config.js is set up to use these variables, e.g.:
        fontFamily: {
          sans: ['var(--font-nunito-sans)'],
          display: ['var(--font-poppins)'],
        }
      */}
      <body className="flex flex-col min-h-screen body-with-bg font-sans">
        <I18nProviderClient locale={locale}>
          <Header session={session} />
          <main className="flex-grow">{children}</main>
          {/* FIX: Pass the 'locale' prop to Footer as 'lang' */}
          <Footer lang={locale} />
        </I18nProviderClient>
        <CookieConsent />
      </body>
    </html>
  );
}
