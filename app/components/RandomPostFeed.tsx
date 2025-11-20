'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { DetailedPost } from '@/lib/types';
import { useI18n } from '@/locales/client';
import PostCard from './PostCard';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { MosaicSkeleton } from './Skeleton';

const RandomPostFeed = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const t = useI18n() as any;
  const [posts, setPosts] = useState<DetailedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const POSTS_TO_SHOW = 4;
  const POSTS_PER_LOAD = 4;

    const fetchPosts = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
      setIsTransitioning(true);
    }

    try {
      const { data } = await supabase.rpc('get_random_public_posts', {
        limit_count: POSTS_TO_SHOW,
      });

      if (data) {
        if (showRefreshing) {
                    setTimeout(() => {
            setPosts(data);
            setHasMore(true);                         setTimeout(() => {
              setIsTransitioning(false);
              setTimeout(() => setIsRefreshing(false), 100);
            }, 50);
          }, 300);
        } else {
          setPosts(data);
          setHasMore(data.length >= POSTS_TO_SHOW);
        }
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setIsTransitioning(false);
      setIsRefreshing(false);
    } finally {
      if (!showRefreshing) {
        setIsLoading(false);
      }
    }
  }, [POSTS_TO_SHOW]);

    const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const { data } = await supabase.rpc('get_random_public_posts', {
        limit_count: POSTS_PER_LOAD,
      });

      if (data && data.length > 0) {
        setPosts(prevPosts => [...prevPosts, ...data]);
        setHasMore(data.length >= POSTS_PER_LOAD);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, POSTS_PER_LOAD]);

    useEffect(() => {
    fetchPosts(false);
  }, [fetchPosts]);

  const handleRefresh = useCallback(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <h2 className="mb-4 text-center text-2xl sm:text-3xl font-bold text-foreground">
          {t('home.mosaic.title')}
        </h2>
        <p className="mb-8 text-center text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl mx-auto">
          {t('home.mosaic.subtitle')}
        </p>
        <MosaicSkeleton count={POSTS_TO_SHOW} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <h2 className="mb-4 text-center text-2xl sm:text-3xl font-bold text-foreground">
        {t('home.mosaic.title')}
      </h2>
      <p className="mb-8 text-center text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl mx-auto">
        {t('home.mosaic.subtitle')}
      </p>

      {}
      {posts.length > 0 ? (
        <div className="space-y-6">
          {}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 transition-all duration-500 ease-in-out ${
              isTransitioning
                ? 'opacity-0 scale-95 translate-y-2'
                : 'opacity-100 scale-100 translate-y-0'
            }`}
          >
            {posts.map((post, index) => (
              <div
                key={post.id}
                className={`transition-all duration-500 ease-out hover:scale-[1.02] ${
                  isTransitioning ? 'opacity-0' : 'opacity-100'
                }`}
                style={{
                  animationDelay: `${index * 75}ms`,
                  transitionDelay: isTransitioning ? '0ms' : `${index * 75}ms`,
                }}
              >
                <PostCard
                  post={post}
                  isLoggedIn={isLoggedIn}
                  isMini={false}
                />
              </div>
            ))}
          </div>

          {}
          <div className="flex justify-center pt-4">
            {}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="group flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowPathIcon
                className={`h-5 w-5 transition-transform duration-500 ${
                  isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'
                }`}
              />
              <span className="font-medium">
                {isRefreshing ? t('home.mosaic.loading') : t('home.mosaic.see_more')}
              </span>
            </button>
          </div>

          {}
          {isLoadingMore && (
            <div className="mt-6">
              <MosaicSkeleton count={POSTS_PER_LOAD} />
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {t('home.mosaic.no_stories')}
          </p>
        </div>
      )}
    </div>
  );
};

export default RandomPostFeed;