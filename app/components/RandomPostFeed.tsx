'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DetailedPost } from '@/lib/types';
import { useI18n } from '@/locales/client';
import PostCard from './PostCard';

interface AnimatingPost {
  id: string;
  post: DetailedPost;
  position: number; // 0-100 for vertical position
}

const RandomPostFeed = () => {
  const t = useI18n();
  const [posts, setPosts] = useState<DetailedPost[]>([]);
  const [usedPostIds, setUsedPostIds] = useState<Set<string>>(new Set());
  const [animatingPosts, setAnimatingPosts] = useState<AnimatingPost[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [nextId, setNextId] = useState(0);

  // Fetch posts on mount and periodically refresh
  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase.rpc('get_random_public_posts', {
        limit_count: 50, // Increased pool size to reduce duplicates
      });
      if (data) {
        setPosts(data);
        // Reset used post IDs when refreshing pool
        setUsedPostIds(new Set());
      }
    };

    // Fetch immediately on mount
    fetchPosts();

    // Refresh posts every 20 seconds to maintain a continuous supply
    const refreshInterval = setInterval(fetchPosts, 20000);
    return () => clearInterval(refreshInterval);
  }, []);

  // Animation loop - moves posts DOWN from top to bottom, fades them out, removes them when done
  useEffect(() => {
    if (posts.length === 0 || isPaused) return;

    const animationLoop = setInterval(() => {
      setAnimatingPosts((prevPosts) => {
        let updated = prevPosts
          .map((p) => ({
            ...p,
            position: p.position + 0.8, // Increased speed for more continuous feel
          }))
          .filter((p) => p.position < 120); // Remove when past bottom (with fade)

        // Keep feeding posts to maintain continuous flow
        while (updated.length < 6 && posts.length > 0) {
          // Find an unused post
          let availablePosts = posts.filter((p) => !usedPostIds.has(String(p.id)));

          // If all posts are used, reset and allow reuse (but cycle through at least once)
          if (availablePosts.length === 0 && usedPostIds.size > posts.length / 2) {
            setUsedPostIds(new Set());
            availablePosts = posts;
          }

          if (availablePosts.length > 0) {
            const randomPost = availablePosts[Math.floor(Math.random() * availablePosts.length)];
            updated.push({
              id: `${nextId}-${Date.now()}`,
              post: randomPost,
              position: -100, // Start at top (above viewport)
            });
            setUsedPostIds((prev) => new Set([...prev, String(randomPost.id)]));
            setNextId((prev) => prev + 1);
          } else {
            break;
          }
        }

        return updated;
      });
    }, 33); // ~30fps animation (faster refresh for smoother continuous flow)

    return () => clearInterval(animationLoop);
  }, [posts, isPaused, nextId, usedPostIds]);

  // Calculate opacity based on position (fade at top and bottom)
  const getOpacity = (position: number): number => {
    if (position < -10) return Math.max(0, 1 + (position + 10) / 15); // Fade in from top
    if (position > 85) return Math.max(0, 1 - (position - 85) / 15); // Fade out at bottom
    return 1;
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <h2 className="mb-4 text-center text-2xl sm:text-3xl font-bold text-foreground">
        {t('home.mosaic.title')}
      </h2>
      <p className="mb-8 text-center text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl mx-auto">
        {t('home.mosaic.subtitle')}
      </p>

      {/* Single column infinite scroll container */}
      <div
        className="relative mx-auto w-full max-w-sm h-[500px] overflow-hidden rounded-lg border border-border bg-background/50 backdrop-blur-sm"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Gradient overlays for fade effect */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

        {/* Scrolling posts */}
        <div className="relative w-full h-full">
          {animatingPosts.map((animPost) => (
            <div
              key={animPost.id}
              className="absolute w-full px-4 transition-opacity duration-300"
              style={{
                top: `calc(${animPost.position}% + 20px)`, // Add 20px gap between posts
                transform: 'translateY(-50%)',
                opacity: getOpacity(animPost.position),
                pointerEvents: animPost.position > 15 && animPost.position < 85 ? 'auto' : 'none',
              }}
            >
              <PostCard
                post={animPost.post}
                isLoggedIn={false}
                isMini={true}
              />
            </div>
          ))}
        </div>

        {/* Loading/Empty state */}
        {animatingPosts.length === 0 && posts.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground text-center px-4">
              Loading stories...
            </p>
          </div>
        )}

        {animatingPosts.length === 0 && posts.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground text-center px-4">
              {t('home.mosaic.no_stories')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RandomPostFeed;
