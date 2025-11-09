'use client';

import { useState } from 'react';
import PostCard from '@/app/components/PostCard';
import { DetailedPost } from '@/lib/types';
import { useI18n } from '@/locales/client';
import Image from 'next/image';

const POSTS_PER_PAGE = 20;

interface PaginatedPostsProps {
  posts: DetailedPost[];
  isLoggedIn: boolean;
}

export default function PaginatedPosts({ posts, isLoggedIn }: PaginatedPostsProps) {
  const t = useI18n() as any;
  const [displayCount, setDisplayCount] = useState(POSTS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);

  const displayedPosts = posts.slice(0, displayCount);
  const hasMore = displayCount < posts.length;
  const remainingCount = posts.length - displayCount;

  const handleLoadMore = () => {
    setIsLoading(true);
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + POSTS_PER_PAGE, posts.length));
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="space-y-6">
      {displayedPosts.map((post: DetailedPost) => (
        <PostCard key={post.id} post={post} isLoggedIn={isLoggedIn} />
      ))}

      {hasMore && (
        <div className="flex flex-col items-center justify-center py-8 space-y-3">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="btn-primary px-8 py-3 text-base font-medium flex items-center gap-3 min-w-[200px] justify-center"
          >
            {isLoading ? (
              <>
                <Image
                  src="/loading.gif"
                  alt={t('lighter.loading')}
                  width={20}
                  height={20}
                  unoptimized={true}
                />
                <span>{t('lighter.loading')}</span>
              </>
            ) : (
              <>
                <span>{t('lighter.load_more')}</span>
                <span className="text-sm opacity-80">({remainingCount} more)</span>
              </>
            )}
          </button>
        </div>
      )}

      {!hasMore && posts.length > POSTS_PER_PAGE && (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground font-medium">
            {t('lighter.all_loaded')}
          </p>
        </div>
      )}
    </div>
  );
}
