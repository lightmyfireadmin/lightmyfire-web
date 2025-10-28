'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase'; // Assumes lib is at root
import type { MyPostWithLighter } from './page'; // Type from parent page
import Link from 'next/link';
import { TrashIcon } from '@heroicons/react/24/outline'; // Use Heroicon

export default function MyPostsList({
  initialPosts,
}: {
  initialPosts: MyPostWithLighter[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [error, setError] = useState('');

  const handleDelete = async (postId: number) => {
    setError('');
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    const { error } = await supabase.from('posts').delete().eq('id', postId);

    if (error) {
      setError(`Error deleting post: ${error.message}`);
    } else {
      setPosts(posts.filter((post) => post.id !== postId));
    }
  };

  if (posts.length === 0) {
    // Use theme muted text
    return <p className="text-sm text-muted-foreground">You haven&apos;t made any posts yet.</p>;
  }

  return (
    <div className="flow-root">
      {error && <p className="mb-4 text-center text-red-500">{error}</p>}
      {/* Use theme border */}
      <ul className="-my-4 divide-y divide-border">
        {posts.map((post) => (
          <li
            key={post.id}
            className="flex items-center justify-between space-x-4 py-4"
          >
            <div className="min-w-0 flex-1">
              {/* Use theme text */}
              <p className="truncate text-sm font-medium text-foreground">
                {post.title || `A ${post.post_type} post`}
              </p>
              {/* Use theme muted text and primary link color */}
              <p className="truncate text-sm text-muted-foreground">
                on{' '}
                <Link
                  href={`/lighter/${post.lighter_id}`}
                  className="font-medium text-primary hover:underline" // Use primary color
                >
                  {post.lighters?.name || 'a lighter'}
                </Link>
                {' on '}
                <span suppressHydrationWarning={true}>
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </p>
            </div>
            <button
              onClick={() => handleDelete(post.id)}
              // Use theme muted text, hover red
              className="inline-flex items-center rounded-md p-2 text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
            >
              <span className="sr-only">Delete</span>
              <TrashIcon className="h-5 w-5" aria-hidden="true"/>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}