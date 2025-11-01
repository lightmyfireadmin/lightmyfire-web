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
  const [animatingPosts, setAnimatingPosts] = useState<AnimatingPost[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [nextId, setNextId] = useState(0);

  // Fetch posts on mount
  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase.rpc('get_random_public_posts', {
        limit_count: 10,
      });
      if (data) {
        setPosts(data);
      }
    };
    fetchPosts();
  }, []);

  // Animation loop - moves posts up, fades them out, removes them when done
  useEffect(() => {
    if (posts.length === 0 || isPaused) return;

    const animationLoop = setInterval(() => {
      setAnimatingPosts((prevPosts) => {
        let updated = prevPosts
          .map((p) => ({
            ...p,
            position: p.position + 1.5, // Slow scroll speed: 1.5% per frame (60fps = ~6 seconds full height)
          }))
          .filter((p) => p.position < 120); // Remove when past top (with fade)

        // Add new post at bottom occasionally
        if (Math.random() < 0.3 && updated.length < 3) {
          const randomPost = posts[Math.floor(Math.random() * posts.length)];
          updated.push({
            id: `${nextId}-${Date.now()}`,
            post: randomPost,
            position: 0,
          });
          setNextId((prev) => prev + 1);
        }

        return updated;
      });
    }, 50); // ~60fps animation

    return () => clearInterval(animationLoop);
  }, [posts, isPaused, nextId]);

  // Calculate opacity based on position (fade at top)
  const getOpacity = (position: number): number => {
    if (position < 10) return 1; // Full opacity at bottom
    if (position > 85) return Math.max(0, 1 - (position - 85) / 15); // Fade out near top
    return 1;
  };

  if (posts.length === 0) {
    return null;
  }

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
                top: `${animPost.position}%`,
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

        {/* Pause indicator */}
        {isPaused && animatingPosts.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20 rounded-lg">
            <div className="text-white text-sm font-medium opacity-75">⏸ Paused</div>
          </div>
        )}

        {/* Empty state */}
        {animatingPosts.length === 0 && (
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
