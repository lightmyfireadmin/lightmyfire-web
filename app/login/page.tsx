// app/login/page.tsx
'use client';

import { supabase } from '@/lib/supabase'; // Assuming lib is at root
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();

  // Construct the redirect URL robustly
  const getRedirectUrl = () => {
    let url =
      process.env.NEXT_PUBLIC_VERCEL_URL ?? // Vercel system env var (requires expose in next.config.js)
      process.env.NEXT_PUBLIC_SITE_URL ?? // Or use your own custom env var
      'http://localhost:3000/'; // Fallback for local development
    // Make sure to include `https://` when not localhost.
    url = url.includes('http') ? url : `https://${url}`;
    // Ensure it doesn't end with a trailing slash
    url = url.charAt(url.length - 1) === '/' ? url.slice(0, -1) : url;
    return `${url}/auth/callback`; // Append the callback path
  };


  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        router.refresh();
        router.push('/');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router]); // supabase removed

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4"> {/* Use theme bg */}
      <div className="w-full max-w-md rounded-xl bg-background p-8 shadow-lg"> {/* Use theme bg */}
        <h1 className="mb-6 text-center text-3xl font-bold text-foreground"> {/* Use theme text */}
          LightMyFire
        </h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }} // You can customize appearance later
          theme="light" // Or 'dark'
          providers={['google']} // Only Google enabled for now
          // Use the function to get the correct URL
          redirectTo={getRedirectUrl()}
        />
      </div>
    </div>
  );
}