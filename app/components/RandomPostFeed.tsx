'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DetailedPost } from '@/lib/types';
import { useI18n } from '@/locales/client';
import PostCard from './PostCard';

const RandomPostFeed = () => {
  const t = useI18n();
  const [posts, setPosts] = useState<DetailedPost[]>([]);
  const [visiblePostIndex1, setVisiblePostIndex1] = useState(0);
  const [visiblePostIndex2, setVisiblePostIndex2] = useState(1);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase.rpc('get_random_public_posts', {
        limit_count: 5,
      });
      if (data) {
        setPosts(data);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      const interval1 = setInterval(() => {
        setVisiblePostIndex1((prevIndex) => (prevIndex + 2) % posts.length);
      }, 4000); // 4 seconds display + 300ms fade

      const interval2 = setInterval(() => {
        setVisiblePostIndex2((prevIndex) => (prevIndex + 2) % posts.length);
      }, 4000);

      return () => {
        clearInterval(interval1);
        clearInterval(interval2);
      };
    }
  }, [posts]);

  if (posts.length < 2) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <h2 className="mb-8 text-center text-2xl sm:text-3xl font-bold text-foreground">
        {t('home.mosaic.title')}
      </h2>

      {/* Fixed container to prevent layout shift */}
      <div className="relative flex flex-col md:flex-row justify-center gap-4 md:gap-6">
        {/* Post 1 - Fixed height container */}
        <div className="w-full md:w-1/2 min-h-[320px] flex items-start">
          <div key={`post1-${visiblePostIndex1}`} className="w-full animate-fade-in-out opacity-95">
            <PostCard
              post={posts[visiblePostIndex1]}
              isLoggedIn={false}
              isMini={true}
            />
          </div>
        </div>

        {/* Post 2 - Fixed height container */}
        <div className="w-full md:w-1/2 min-h-[320px] flex items-start">
          <div key={`post2-${visiblePostIndex2}`} className="w-full animate-fade-in-out opacity-95">
            <PostCard
              post={posts[visiblePostIndex2]}
              isLoggedIn={false}
              isMini={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RandomPostFeed;
