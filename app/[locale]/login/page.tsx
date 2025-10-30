'use client';

import { supabase } from '@/lib/supabase'; // Assuming lib is at root
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();

  const getRedirectUrl = () => {
    let url =
      process.env.NEXT_PUBLIC_VERCEL_URL ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      'http://localhost:3000/';
    url = url.includes('http') ? url : `https://${url}`;
    url = url.charAt(url.length - 1) === '/' ? url.slice(0, -1) : url;
    return `${url}/auth/callback`;
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        console.log('User signed in, forcing full page reload...');
        window.location.href = '/'; // Force a full page reload
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router]); // supabase correctly removed

  return (
    <div className="flex min-h-screen items-center justify-center p-4"> {/* Use theme bg */}
      {/* Applied responsive padding */}
      <div className="w-full max-w-md rounded-xl bg-background p-6 sm:p-8 shadow-lg"> {/* Use theme bg */}
        <h1 className="mb-6 text-center text-3xl font-bold text-foreground">
          LightMyFire
        </h1>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            // Add custom variables here to match theme if desired
            // variables: {
            //   default: {
            //     colors: {
            //       brand: '#B400A3', // primary color
            //       brandAccent: '#a30092', // slightly darker primary
            //       // Add more color overrides if needed
            //     },
            //     // Add font overrides if needed
            //     // fonts: {
            //     //   bodyFontFamily: 'Nunito Sans, sans-serif',
            //     //   buttonFontFamily: 'Nunito Sans, sans-serif',
            //     //   labelFontFamily: 'Nunito Sans, sans-serif',
            //     // },
            //     // Add border radius overrides if needed
            //      radii: {
            //        borderRadiusButton: '0.75rem', // lg
            //        buttonBorderRadius: '0.75rem',
            //        inputBorderRadius: '0.75rem',
            //      },
            //   },
            // },
          }}
          theme="light" // Keep Supabase theme consistent or customize heavily
          providers={['google']}
          redirectTo={getRedirectUrl()}
        />
      </div>
    </div>
  );
}