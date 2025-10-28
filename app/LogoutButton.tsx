'use client';

// Import our single, shared client from /lib
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
    >
      Logout
    </button>
  );
}