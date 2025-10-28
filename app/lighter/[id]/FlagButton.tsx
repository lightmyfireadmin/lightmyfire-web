'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Helper Icon
function FlagIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path d="M3.5 2.75a.75.75 0 0 0-1.5 0v14.5a.75.75 0 0 0 1.5 0v-4.392l1.357 1.1A1.75 1.75 0 0 0 7.5 15.25v-3.665a.75.75 0 0 0-1.09-.65l-2.66 1.1V2.75Z" />
      <path d="M19.25 3.5a.75.75 0 0 0 0-1.5H7.75a.75.75 0 0 0 0 1.5h11.5Z" />
    </svg>
  );
}

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
      return; // Don't let them flag twice
    }

    // Ask for confirmation
    if (
      !window.confirm(
        'Are you sure you want to flag this post for review? This action cannot be undone.'
      )
    ) {
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.rpc('flag_post', {
      post_to_flag_id: postId,
    });

    if (!error) {
      setIsFlagged(true); // Visually confirm flagging
    } else {
      console.error(error);
      alert('Could not flag post. Please try again.');
      setIsLoading(false);
    }
  };

  if (isFlagged) {
    return (
      <span className="flex items-center space-x-1 text-sm text-gray-500">
        <FlagIcon />
        <span>Flagged</span>
      </span>
    );
  }

  return (
    <button
      onClick={handleFlag}
      disabled={isLoading}
      className="flex items-center space-x-1 text-sm text-gray-500 transition hover:text-red-600 disabled:opacity-50"
    >
      <FlagIcon />
      <span>Flag</span>
    </button>
  );
}