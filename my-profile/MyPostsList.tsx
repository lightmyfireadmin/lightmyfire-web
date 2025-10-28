'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { MyPostWithLighter } from './page';
import Link from 'next/link';

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path
        fillRule="evenodd"
        d="M8.75 1A2.75 2.75 0 0 0 6 3.75V4.5h8V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4.5 6 4.5v.75A.75.75 0 0 0 6.75 6h6.5a.75.75 0 0 0 .75-.75V4.5h-4ZM1.95 6.43A1.5 1.5 0 0 0 3 7.5h14a1.5 1.5 0 0 0 1.05-2.57l-1.25-1.5A.75.75 0 0 0 16 3H4a.75.75 0 0 0-.8.43l-1.25 1.5Z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M3 9.75A.75.75 0 0 1 3.75 9h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 9.75ZM4.12 12.38a.75.75 0 0 1 .63.09l.56.56a.75.75 0 0 1-1.06 1.06l-.56-.56a.75.75 0 0 1 .43-1.15Zm11.76 0a.75.75 0 0 1 .43 1.15l-.56.56a.75.75 0 0 1-1.06-1.06l.56-.56a.75.75 0 0 1 .63-.09ZM6.25 15a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 6.25 15Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function MyPostsList({
  initialPosts,
}: {
  initialPosts: MyPostWithLighter[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [error, setError] = useState('');

  const handleDelete = async (postId: number) => {
    setError('');
    // --- THIS IS THE FIX ---
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
    return <p className="text-sm text-gray-500">You haven&apos;t made any posts yet.</p>;
  }

  return (
    <div className="flow-root">
      {error && <p className="mb-4 text-center text-red-500">{error}</p>}
      <ul className="-my-4 divide-y divide-gray-200">
        {posts.map((post) => (
          <li
            key={post.id}
            className="flex items-center justify-between space-x-4 py-4"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {post.title || `A ${post.post_type} post`}
              </p>
              <p className="truncate text-sm text-gray-500">
                on{' '}
                <Link
                  href={`/lighter/${post.lighter_id}`}
                  className="font-medium text-blue-600 hover:underline"
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
              className="inline-flex items-center rounded-md p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
            >
              <span className="sr-only">Delete</span>
              <TrashIcon />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}