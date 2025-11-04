'use client';

import { useState } from 'react';
import { DetailedPost } from '@/lib/types';
import ModerationPostCard from './ModerationPostCard';
import EmptyState from '@/app/components/EmptyState';
import { useCurrentLocale } from '@/locales/client';

interface ModerationQueueProps {
  initialPosts: DetailedPost[];
}

export default function ModerationQueue({ initialPosts }: ModerationQueueProps) {
  const [posts, setPosts] = useState(initialPosts);
  const locale = useCurrentLocale();

  const handlePostAction = (postId: number) => {
    
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  };

  if (posts.length === 0) {
    return (
      <EmptyState
        illustration="/illustrations/thumbs_up.png"
        title="Queue is Empty"
        description="All flagged posts have been reviewed and handled. Great moderation work!"
        action={{
          label: 'Back to Home',
          onClick: () => (window.location.href = `/${locale}`),
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
          {posts.length} post{posts.length !== 1 ? 's' : ''} awaiting moderation
        </p>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <ModerationPostCard key={post.id} post={post} onAction={handlePostAction} />
        ))}
      </div>
    </div>
  );
}
