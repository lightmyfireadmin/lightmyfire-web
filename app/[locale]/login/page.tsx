'use client';

import { supabase } from '@/lib/supabase'; 
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '@/lib/context/ToastContext';
import { useI18n } from '@/locales/client';

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const t = useI18n() as any;

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
        
        sessionStorage.setItem('showLoginNotification', 'true');
        window.location.href = '/'; 
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router]); 

  return (
    <div className="flex min-h-screen items-center justify-center p-4"> {}
      {}
      <div className="w-full max-w-md rounded-xl bg-background p-6 sm:p-8 shadow-lg"> {}
        <h1 className="mb-6 text-center text-3xl font-bold text-foreground">
          LightMyFire
        </h1>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
          }}
          theme="light" 
          providers={['google']}
          redirectTo={getRedirectUrl()}
        />
      </div>
    </div>
  );
}