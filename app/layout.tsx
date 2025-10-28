import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import LogoutButton from './LogoutButton';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
        <nav className="flex w-full items-center justify-between bg-white p-4 shadow-md">
          <div className="flex flex-wrap items-center space-x-4">
            <Link href="/" className="text-xl font-bold text-gray-800">
              LightMyFire 🔥
            </Link>
            <Link href="/find" className="text-gray-600 hover:text-blue-600">
              Find a Lighter
            </Link>

            {/* Public Links */}
            <Link
              href="/dont-throw-me-away"
              className="hidden text-gray-600 hover:text-blue-600 sm:block"
            >
              Refill
            </Link>
            <Link
              href="/about"
              className="hidden text-gray-600 hover:text-blue-600 sm:block"
            >
              About
            </Link>

            {/* Session-Only Links */}
            {session && (
              <>
                <Link
                  href="/save-lighter"
                  className="hidden text-gray-600 hover:text-blue-600 sm:block"
                >
                  Save
                </Link>
                <Link
                  href="/my-profile"
                  className="text-gray-600 hover:text-blue-600"
                >
                  My Profile
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {session ? (
              <LogoutButton />
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Login
              </Link>
            )}
          </div>
        </nav>
        {/* The children prop renders all your pages here */}
        <main>{children}</main>
      </body>
    </html>
  );
}