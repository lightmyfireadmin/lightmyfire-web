'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DetailedPost } from '@/lib/types';
import { useI18n } from '@/locales/client';
import PostCard from './PostCard';

interface AnimatingPost {
  id: string;
  post: DetailedPost;
  position: number; // vertical position in pixels
}

const RandomPostFeed = () => {
  const t = useI18n();
  const [posts, setPosts] = useState<DetailedPost[]>([]);
  const [animatingPosts, setAnimatingPosts] = useState<AnimatingPost[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [nextId, setNextId] = useState(0);
  const CONTAINER_HEIGHT = 500;
  const POST_SPACING = 26;

  // Fetch posts on mount and periodically refresh
  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase.rpc('get_random_public_posts', {
        limit_count: 50, // Increased pool size to reduce duplicates
      });
      if (data) {
        setPosts(data);
      }
    };

    // Fetch immediately on mount
    fetchPosts();

    // Refresh posts every 15 seconds to maintain supply
    const refreshInterval = setInterval(fetchPosts, 15000);
    return () => clearInterval(refreshInterval);
  }, []);

  // Animation loop - smooth continuous scrolling
  useEffect(() => {
    if (posts.length === 0 || isPaused) return;

    const animationLoop = setInterval(() => {
      setAnimatingPosts((prevPosts) => {
        // Move all posts down by fixed amount (smooth scroll)
        let updated = prevPosts
          .map((p) => ({
            ...p,
            position: p.position + 2, // 2px per frame = smooth scroll
          }))
          .filter((p) => p.position < CONTAINER_HEIGHT + 400); // Remove when fully past bottom

        // Add new posts to top when space available
        if (posts.length > 0) {
          // Check if we need a new post at top
          const topmost = updated.length > 0 ? Math.min(...updated.map(p => p.position)) : 0;

          if (topmost > -600) { // Start spawning when container is mostly empty
            const randomPost = posts[Math.floor(Math.random() * posts.length)];
            updated.unshift({
              id: `${nextId}-${Date.now()}`,
              post: randomPost,
              position: -380, // Start above viewport
            });
            setNextId((prev) => prev + 1);
          }
        }

        return updated;
      });
    }, 16); // ~60fps for smooth animation

    return () => clearInterval(animationLoop);
  }, [posts, isPaused, nextId]); // Removed nextId and other deps causing rerenders

  // Calculate opacity based on position in pixels (fade at top and bottom)
  const getOpacity = (position: number): number => {
    if (position < 0) return Math.max(0, 1 + position / 80); // Fade in from top
    if (position > CONTAINER_HEIGHT - 80) return Math.max(0, 1 - (position - (CONTAINER_HEIGHT - 80)) / 80); // Fade out at bottom
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
                top: `${animPost.position}px`,
                opacity: getOpacity(animPost.position),
                pointerEvents: animPost.position > 50 && animPost.position < CONTAINER_HEIGHT - 100 ? 'auto' : 'none',
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
