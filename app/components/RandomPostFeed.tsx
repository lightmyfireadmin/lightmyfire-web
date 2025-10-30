'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DetailedPost } from '@/lib/types';
import PostCard from './PostCard';

const RandomPostFeed = () => {
  const [posts, setPosts] = useState<DetailedPost[]>([]);
  const [visiblePostIndex1, setVisiblePostIndex1] = useState(0);
  const [visiblePostIndex2, setVisiblePostIndex2] = useState(1);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase.rpc('get_random_public_posts', {
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
      }, 1500); // Change post1 every 1.5 seconds

      const interval2 = setInterval(() => {
        setVisiblePostIndex2((prevIndex) => (prevIndex + 2) % posts.length);
      }, 1500); // Change post2 every 1.5 seconds

      return () => {
        clearInterval(interval1);
        clearInterval(interval2);
      };
    }
  }, [posts]);

  if (posts.length < 2) {
    return null; // Need at least two posts for this animation
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-2.5 lg:px-8 py-12 sm:py-16">
      <h2 className="mb-8 text-center text-3xl font-bold text-foreground">
        Stories from the Mosaic
      </h2>
      <div className="relative flex flex-col md:flex-row justify-center gap-4 md:gap-8">
        {/* Post 1 */}
        <div
          className={`w-full md:w-1/2 transition-opacity duration-[900ms] ${visiblePostIndex1 % 2 === 0 ? 
'opacity-100' : 'opacity-0'}`}
        >
          <PostCard post={posts[visiblePostIndex1]} isLoggedIn={false} isMini={true} />
        </div>
        {/* Post 2 */}
        <div
          className={`w-full md:w-1/2 transition-opacity duration-[900ms] ${visiblePostIndex2 % 2 === 0 ? 
'opacity-100' : 'opacity-0'}`}
        >
          <PostCard post={posts[visiblePostIndex2]} isLoggedIn={false} isMini={true} />
        </div>
      </div>
    </div>
  );
};

export default RandomPostFeed;