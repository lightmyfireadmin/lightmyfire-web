'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DetailedPost } from '@/lib/types';
import { useI18n } from '@/locales/client';
import PostCard from './PostCard';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const RandomPostFeed = () => {
  const t = useI18n();
  const [posts, setPosts] = useState<DetailedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const POSTS_TO_SHOW = 4; 

  
  const fetchPosts = async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);

    try {
      const { data } = await supabase.rpc('get_random_public_posts', {
        limit_count: POSTS_TO_SHOW,
      });

      if (data) {
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
      if (showRefreshing) {
        
        setTimeout(() => setIsRefreshing(false), 300);
      }
    }
  };

  
  useEffect(() => {
    fetchPosts(false);
  }, []);

  const handleRefresh = () => {
    fetchPosts(true);
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <h2 className="mb-4 text-center text-2xl sm:text-3xl font-bold text-foreground">
          {t('home.mosaic.title')}
        </h2>
        <p className="mb-8 text-center text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl mx-auto">
          {t('home.mosaic.subtitle')}
        </p>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading stories...</p>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {posts.map((post, index) => (
              <div
                key={`${post.id}-${index}`}
                className="transition-all duration-300 hover:scale-[1.02]"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <PostCard
                  post={post}
                  isLoggedIn={false}
                  isMini={false}
                />
              </div>
            ))}
          </div>

          {}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="group flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowPathIcon
                className={`h-5 w-5 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`}
              />
              <span className="font-medium">
                {isRefreshing ? 'Loading...' : 'See More Stories'}
              </span>
            </button>
          </div>
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
