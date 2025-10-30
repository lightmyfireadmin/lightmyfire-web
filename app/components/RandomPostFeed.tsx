'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DetailedPost } from '@/lib/types';
import PostCard from './PostCard';

const RandomPostFeed = () => {
  const [posts, setPosts] = useState<DetailedPost[]>([]);
  const [visiblePostIndex, setVisiblePostIndex] = useState(0);

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
      const interval = setInterval(() => {
        setVisiblePostIndex((prevIndex) => (prevIndex + 1) % posts.length);
      }, 5000); // Change post every 5 seconds
      return () => clearInterval(interval);
    }
  }, [posts]);

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16 lg:px-8">
      <h2 className="mb-8 text-center text-3xl font-bold text-foreground">
        Stories from the Mosaic
      </h2>
      <div className="relative h-96">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className={`absolute w-full transition-opacity duration-1000 ${index === visiblePostIndex ? 'opacity-100' : 'opacity-0'}`}>
            <PostCard post={post} isLoggedIn={false} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RandomPostFeed;
