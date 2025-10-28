'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase'; // Assumes lib is at root
import { useRouter } from 'next/navigation';
import { FlagIcon } from '@heroicons/react/24/outline'; // Use Heroicon

export default function FlagButton({
  postId,
  isLoggedIn,
}: {
  postId: number;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [isFlagged, setIsFlagged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFlag = async () => {
    if (!isLoggedIn) {
      router.push('/login?message=You must be logged in to flag a post');
      return;
    }
    if (isFlagged || isLoading) {
      return;
    }
    if (!window.confirm('Are you sure you want to flag this post for review? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.rpc('flag_post', {
      post_to_flag_id: postId,
    });

    if (!error) {
      setIsFlagged(true);
    } else {
      console.error(error);
      alert('Could not flag post. Please try again.');
      setIsLoading(false); // Only reset loading on error
    }
    // No need to reset loading on success, as the button disappears
  };

  if (isFlagged) {
    return (
      // Use theme muted text
      <span className="flex items-center space-x-1 text-sm text-muted-foreground">
        <FlagIcon className="h-5 w-5" aria-hidden="true" />
        <span>Flagged</span>
      </span>
    );
  }

  return (
    <button
      onClick={handleFlag}
      disabled={isLoading}
      // Use theme muted text, hover red
      className="flex items-center space-x-1 text-sm text-muted-foreground transition hover:text-red-600 disabled:opacity-50"
    >
      <FlagIcon className="h-5 w-5" aria-hidden="true" />
      <span>Flag</span>
    </button>
  );
}