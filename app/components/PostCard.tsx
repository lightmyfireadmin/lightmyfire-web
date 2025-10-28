'use client';

// This component renders a single post.
// It's a client component because Like/Flag buttons are interactive.

import { DetailedPost } from '@/lib/types';
// Assuming LikeButton and FlagButton remain in app/lighter/[id] for now
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
    // Use theme colors for card background and border
    <div className="rounded-lg border border-border bg-background p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        {/* Use theme text colors */}
        <span className="font-semibold text-foreground">{post.username}</span>
        <span
          className="text-sm text-muted-foreground"
          suppressHydrationWarning={true}
        >
          {new Date(post.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Post Body - Renders all types */}
      <div className="space-y-3">
        {post.title && <h3 className="text-xl font-bold text-foreground">{post.title}</h3>}

        {post.post_type === 'text' && (
          <p className="whitespace-pre-wrap text-foreground"> {/* Use theme text */}
            {post.content_text}
          </p>
        )}

        {post.post_type === 'location' && (
          <p className="text-foreground"> {/* Use theme text */}
            📍 {post.location_name || 'A location'}
          </p>
        )}

        {post.post_type === 'refuel' && (
          // Consider a theme color for refuel, e.g., text-green-600 or secondary-foreground
          <p className="font-semibold text-green-600">
            🔥 Refueled! This lighter&apos;s journey continues.
          </p>
        )}

        {post.post_type === 'image' && post.content_url && (
          <img
            src={post.content_url}
            alt={post.title || 'User upload'}
            className="w-full rounded-md border border-border" // Use theme border
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
        {/* LikeButton uses its own specific styling */}
        <LikeButton post={post} isLoggedIn={isLoggedIn} />
        {/* FlagButton uses specific styling */}
        <FlagButton postId={post.id} isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}