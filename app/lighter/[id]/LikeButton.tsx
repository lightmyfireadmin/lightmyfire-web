'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LikeButton({
  post,
  isLoggedIn,
}: {
  post: { id: number; like_count: number; user_has_liked: boolean };
  isLoggedIn: boolean;
}) {
  const router = useRouter();

  // We use the server-provided data for the initial state
  const [likes, setLikes] = useState(post.like_count);
  const [isLiked, setIsLiked] = useState(post.user_has_liked);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (!isLoggedIn) {
      // If user is not logged in, redirect them
      router.push('/login?message=You must be logged in to like a post');
      return;
    }

    setIsLoading(true);

    // This is an "optimistic update"
    // We update the UI *before* the database call finishes
    if (isLiked) {
      setLikes(likes - 1);
      setIsLiked(false);
    } else {
      setLikes(likes + 1);
      setIsLiked(true);
    }

    // Call the database function
    const { error } = await supabase.rpc('toggle_like', {
      post_to_like_id: post.id,
    });

    if (error) {
      // Something went wrong, revert the UI
      console.error(error);
      if (isLiked) {
        setLikes(likes - 1);
        setIsLiked(false);
      } else {
        setLikes(likes + 1);
        setIsLiked(true);
      }
    }
    
    // We're done, re-enable the button
    setIsLoading(false);
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center space-x-1 rounded-full px-3 py-1 text-sm transition ${
        isLiked
          ? 'bg-red-100 text-red-600'
          : 'bg-gray-100 text-gray-600 hover:bg-red-50'
      }`}
    >
      <span>❤️</span>
      <span>{likes}</span>
    </button>
  );
}