'use client';

// This component renders a single post.
// It's a client component because Like/Flag buttons are interactive.

import { DetailedPost } from '@/lib/types';
import LikeButton from '@/app/lighter/[id]/LikeButton';
import FlagButton from '@/app/lighter/[id]/FlagButton';

// Helper function to get YouTube embed ID
function getYouTubeEmbedId(url: string) {
  let videoId = '';
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (
      urlObj.hostname === 'www.youtube.com' ||
      urlObj.hostname === 'youtube.com'
    ) {
      videoId = urlObj.searchParams.get('v') || '';
    }
    return videoId;
  } catch (error) {
    return null; // Invalid URL
  }
}

export default function PostCard({
  post,
  isLoggedIn,
}: {
  post: DetailedPost;
  isLoggedIn: boolean;
}) {
  let embedId: string | null = null;
  if (post.post_type === 'song' && post.content_url) {
    embedId = getYouTubeEmbedId(post.content_url);
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-semibold text-gray-700">{post.username}</span>
        <span
          className="text-sm text-gray-500"
          suppressHydrationWarning={true}
        >
          {new Date(post.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Post Body - Renders all types */}
      <div className="space-y-3">
        {post.title && <h3 className="text-xl font-bold">{post.title}</h3>}

        {post.post_type === 'text' && (
          <p className="whitespace-pre-wrap text-gray-800">
            {post.content_text}
          </p>
        )}

        {post.post_type === 'location' && (
          <p className="text-gray-800">
            📍 {post.location_name || 'A location'}
          </p>
        )}

        {post.post_type === 'refuel' && (
          <p className="font-semibold text-green-600">
            🔥 Refueled! This lighter's journey continues.
          </p>
        )}

        {post.post_type === 'image' && post.content_url && (
          <img
            src={post.content_url}
            alt={post.title || 'User upload'}
            className="w-full rounded-md border border-gray-200"
          />
        )}

        {post.post_type === 'song' && embedId && (
          <div className="aspect-video w-full">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${embedId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-md"
            ></iframe>
          </div>
        )}
      </div>

      {/* Post Footer */}
      <div className="mt-4 flex items-center justify-between">
        <LikeButton post={post} isLoggedIn={isLoggedIn} />
        <FlagButton postId={post.id} isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}