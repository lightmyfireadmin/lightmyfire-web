import type { Metadata } from 'next';
// Font loading handled by <link> tags
import './globals.css';
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
    <html lang="en">
      <head>
        {/* Google Font <link> tags */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700&family=Nunito+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      {/* Added flex classes for sticky footer */}
      <body className="flex flex-col min-h-screen">
        <Header session={session} />
        {/* Added flex-grow */}
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}