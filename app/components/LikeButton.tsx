'use client';

import { useState, useRef } from 'react';
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
  const [likes, setLikes] = useState(post.like_count || 0);
  const [isLiked, setIsLiked] = useState(post.user_has_liked || false);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce mechanism using ref to prevent double-clicks
  const isProcessingRef = useRef(false);
  const lastClickTimeRef = useRef(0);

  const handleLike = async () => {
    if (!isLoggedIn) {
      router.push('/login?message=You must be logged in to like a post');
      return;
    }

    // Prevent double-clicks: require 500ms between clicks
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;

    if (isProcessingRef.current || timeSinceLastClick < 500) {
      return; // Silently ignore rapid clicks
    }

    lastClickTimeRef.current = now;
    isProcessingRef.current = true;
    setIsLoading(true);

    
    const originalLikes = likes;
    const originalIsLiked = isLiked;
    if (isLiked) {
      setLikes(likes - 1);
      setIsLiked(false);
    } else {
      setLikes(likes + 1);
      setIsLiked(true);
    }

    const { error } = await supabase.rpc('toggle_like', {
      post_to_like_id: post.id,
    });

    if (error) {
      console.error(error);
      // Rollback optimistic update on error
      setLikes(originalLikes);
      setIsLiked(originalIsLiked);
    }

    setIsLoading(false);
    isProcessingRef.current = false;
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      
      className={`flex items-center space-x-1 rounded-full px-3 py-1 text-sm transition ${
        isLiked
          ? 'bg-red-100 text-red-600 hover:bg-red-200' // Added hover state for liked
          : 'bg-muted text-muted-foreground hover:bg-red-50 hover:text-red-500' // Use theme muted colors, hover red
      } disabled:opacity-50`}
    >
      <span>❤️</span>
      <span>{likes}</span>
    </button>
  );
}