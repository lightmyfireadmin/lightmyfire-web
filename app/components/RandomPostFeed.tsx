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
      }, 10000); // Change post1 every 10 seconds

      const interval2 = setInterval(() => {
        setVisiblePostIndex2((prevIndex) => (prevIndex + 2) % posts.length);
      }, 10000); // Change post2 every 10 seconds

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
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16 lg:px-8">
      <h2 className="mb-8 text-center text-3xl font-bold text-foreground">
        Stories from the Mosaic
      </h2>
      <div className="relative flex justify-center items-center h-[400px] space-x-4">
        {/* Post 1 */}
        <div
          className={`absolute w-1/2 transition-opacity duration-2000 ${visiblePostIndex1 % 2 === 0 ? 'opacity-100' : 'opacity-0'}`}
          style={{ left: '0%', transform: 'translateX(-50%)' }}
        >
          <PostCard post={posts[visiblePostIndex1]} isLoggedIn={false} />
        </div>
        {/* Post 2 */}
        <div
          className={`absolute w-1/2 transition-opacity duration-2000 ${visiblePostIndex2 % 2 === 0 ? 'opacity-100' : 'opacity-0'}`}
          style={{ right: '0%', transform: 'translateX(50%)' }}
        >
          <PostCard post={posts[visiblePostPostIndex2]} isLoggedIn={false} />
        </div>
      </div>
    </div>
  );
};

export default RandomPostFeed;
