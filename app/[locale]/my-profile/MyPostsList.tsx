'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { MyPostWithLighter } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrashIcon } from '@heroicons/react/24/outline';
import ConfirmModal from '@/app/components/ConfirmModal';
import EmptyState from '@/app/components/EmptyState';
import { useI18n, useCurrentLocale } from '@/locales/client';

export default function MyPostsList({
  initialPosts,
}: {
  initialPosts: MyPostWithLighter[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const locale = useCurrentLocale();
  // Using unknown cast because useI18n type inference might be tricky here without deeper changes
  const t = useI18n() as unknown as (key: string, params?: Record<string, string | number>) => string;

  const handleDeleteClick = (postId: number) => {
    setPostToDelete(postId);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (postToDelete === null || isDeleting) return;

    setIsDeleting(true);
    setError('');

    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', postToDelete);

    if (deleteError) {
      setError(t('my_posts.error_deleting', { message: 'Failed to delete post' }));
      setIsDeleting(false);
    } else {
      setPosts(posts.filter((post) => post.id !== postToDelete));
      setIsDeleting(false);
    }

    setPostToDelete(null);
  };

  if (posts.length === 0) {
    return (
      <EmptyState
        illustration="/illustrations/telling_stories.png"
        title={t('my_posts.no_posts_title') || 'No Stories Yet'}
        description={t('my_posts.no_posts_description') || 'Start sharing your stories with the community. Visit a lighter to add your first post!'}
        action={{
          label: t('my_posts.no_posts_action') || 'Find a Lighter',
          onClick: () => router.push(`/${locale}`),
        }}
      />
    );
  }

  return (
    <div className="flow-root">
      {error && <p className="mb-4 text-center text-sm text-error">{error}</p>}
      <ul className="-my-4 divide-y divide-border">
        {posts.map((post) => (
          <li
            key={post.id}
            className="flex items-center justify-between space-x-4 py-4"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {post.title || t('my_posts.post_type_default', { type: post.post_type })}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {t('my_posts.on')}{' '}
                <Link
                  href={`/${locale}/lighter/${post.lighter_id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {post.lighters?.name || t('my_posts.a_lighter')}
                </Link>
                {' '}{t('my_posts.the')}{' '}
                <span suppressHydrationWarning={true}>
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </p>
            </div>
            <button
              onClick={() => handleDeleteClick(post.id)}
              className="inline-flex items-center rounded-md p-2 text-muted-foreground transition hover:bg-red-100 hover:text-red-600"
              aria-label={t('my_posts.delete_post_aria')}
            >
              <span className="sr-only">{t('my_posts.delete')}</span>
              <TrashIcon className="h-5 w-5" />
            </button>
          </li>
        ))}
      </ul>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsModalOpen(false);
          }
        }}
        onConfirm={handleConfirmDelete}
        title={t('my_posts.confirm_delete_title')}
        message={t('my_posts.confirm_delete_message')}
        confirmButtonText={isDeleting ? (t('my_posts.deleting') || 'Deleting...') : undefined}
        confirmButtonDisabled={isDeleting}
      />
    </div>
  );
}
