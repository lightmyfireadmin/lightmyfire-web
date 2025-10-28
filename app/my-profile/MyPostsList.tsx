'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase'; // Assuming lib is at root
// Corrected: Import type from central lib/types.ts
import type { MyPostWithLighter } from '@/lib/types';
import Link from 'next/link';
import { TrashIcon } from '@heroicons/react/24/outline'; // Use Heroicon

// Removed local TrashIcon SVG component

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

    const { error: deleteError } = await supabase // Renamed error variable
      .from('posts')
      .delete()
      .eq('id', postId);

    if (deleteError) { // Use renamed variable
      setError(`Error deleting post: ${deleteError.message}`);
    } else {
      setPosts(posts.filter((post) => post.id !== postId));
    }
  };

  if (posts.length === 0) {
    return <p className="text-sm text-muted-foreground">You haven&apos;t made any posts yet.</p>; // Use theme color
  }

  return (
    <div className="flow-root">
      {error && <p className="mb-4 text-center text-sm text-red-500">{error}</p>} {/* Smaller error */}
      <ul className="-my-4 divide-y divide-border"> {/* Use theme border */}
        {posts.map((post) => (
          <li
            key={post.id}
            className="flex items-center justify-between space-x-4 py-4"
          >
            <div className="min-w-0 flex-1">
              {/* Use theme text colors */}
              <p className="truncate text-sm font-medium text-foreground">
                {post.title || `A ${post.post_type} post`}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                on{' '}
                <Link
                  href={`/lighter/${post.lighter_id}`}
                  className="font-medium text-primary hover:underline" // Use theme primary
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
              className="inline-flex items-center rounded-md p-2 text-muted-foreground transition hover:bg-red-100 hover:text-red-600" // Use theme text, adjusted hover
              aria-label="Delete post" // Add aria-label for accessibility
            >
              <span className="sr-only">Delete</span>
              <TrashIcon className="h-5 w-5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}