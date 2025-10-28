import type { Metadata } from 'next';
import { Poppins, Nunito_Sans } from 'next/font/google';
import './globals.css';

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
  style: ['normal', 'italic'],
  variable: '--font-nunito-sans',
});
// Correct import paths assuming components folder is inside app/
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en" className={`${poppins.variable} ${nunito_sans.variable}`}>
      <head>
        {/* Font links are now handled by next/font */}
      </head>
      {/* Added flex classes for sticky footer and font-sans */}
      <body className="flex flex-col min-h-screen font-sans">
        <Header session={session} />
        {/* Added flex-grow */}
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}