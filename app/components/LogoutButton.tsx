'use client';

import { supabase } from '@/lib/supabase'; // Assuming lib is at root
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
      className="btn-secondary text-sm" // Applied btn-secondary, added text-sm
    >
      Logout
    </button>
  );
}