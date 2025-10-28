'use client';

import { DetailedPost } from '@/lib/types'; // Assuming lib is at root
// Adjust these paths based on PostCard's actual location relative to the buttons
import LikeButton from '@/app/lighter/[id]/LikeButton';
import FlagButton from '@/app/lighter/[id]/FlagButton';
import {
  ChatBubbleBottomCenterTextIcon,
  MusicalNoteIcon,
  PhotoIcon,
  MapPinIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import React from 'react'; // Import React for IconComponent type

// Helper function to get YouTube embed ID (remains the same)
function getYouTubeEmbedId(url: string): string | null {
    let videoId = '';
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
            videoId = urlObj.searchParams.get('v') || '';
        }
        return videoId || null;
    } catch (error) {
        return null;
    }
}

// Map post types to icons
const iconMap: { [key in DetailedPost['post_type']]: React.ElementType } = {
    text: ChatBubbleBottomCenterTextIcon,
    image: PhotoIcon,
    location: MapPinIcon,
    song: MusicalNoteIcon,
    refuel: FireIcon,
};

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

  const IconComponent = iconMap[post.post_type] || ChatBubbleBottomCenterTextIcon;
  const isRefuelPost = post.post_type === 'refuel';

  // --- START: Define full class strings explicitly ---
  let cardClasses = "relative rounded-lg border border-border bg-background shadow-sm overflow-hidden border-l-4 ";
  let iconClasses = "h-5 w-5 ";
  let refuelTextClasses = "font-semibold ";

  switch (post.post_type) {
    case 'text':
      cardClasses += "border-blue-500";
      iconClasses += "text-blue-600";
      break;
    case 'image':
      cardClasses += "border-green-500";
      iconClasses += "text-green-600";
      break;
    case 'location':
      cardClasses += "border-yellow-500";
      iconClasses += "text-yellow-600";
      break;
    case 'song':
      cardClasses += "border-red-500";
      iconClasses += "text-red-600";
      break;
    case 'refuel':
      cardClasses += "border-orange-500";
      iconClasses += "text-orange-600";
      refuelTextClasses += "text-orange-600"; // Specific class for refuel text
      break;
    default:
      cardClasses += "border-border"; // Fallback border
      iconClasses += "text-muted-foreground"; // Fallback icon color
  }

  // Add padding class based on type
  cardClasses += isRefuelPost ? ' py-3 pl-4 pr-5' : ' py-5 pl-5 pr-5';
  // --- END: Define full class strings explicitly ---


  return (
    // Apply the fully constructed cardClasses string
    <div className={cardClasses}>

      {/* Post Header */}
      <div className={`mb-3 flex items-center justify-between ${isRefuelPost ? 'mb-2' : 'mb-4'}`}>
        <div className="flex items-center gap-2">
           {/* Apply the fully constructed iconClasses string */}
           {/* <IconComponent className={iconClasses} aria-hidden="true" /> */} {/* Commented out */}
<FireIcon className="h-5 w-5 text-red-500" aria-hidden="true" /> {/* TEMPORARY: Hardcoded specific icon */}
           <span className="font-semibold text-foreground">{post.username}</span>
        </div>
        <span
          className="text-sm text-muted-foreground"
          suppressHydrationWarning={true}
        >
          {new Date(post.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Post Body */}
      <div className={`space-y-3 ${isRefuelPost ? '' : 'pl-1'}`}>
        {!isRefuelPost && post.title && (
            <h3 className="text-xl font-bold text-foreground">{post.title}</h3>
        )}

        {post.post_type === 'text' && (
          <p className="whitespace-pre-wrap text-foreground">
            {post.content_text}
          </p>
        )}

        {post.post_type === 'location' && (
          <p className="text-foreground">
            {post.location_name || 'A location'}
          </p>
        )}

        {isRefuelPost && (
          // Apply the fully constructed refuelTextClasses string
          <p className={refuelTextClasses}>
             Refueled! This lighter&apos;s journey continues.
          </p>
        )}

        {post.post_type === 'image' && post.content_url && (
          <img
            src={post.content_url}
            alt={post.title || 'User upload'}
            className="w-full rounded-md border border-border"
          />
        )}

        {post.post_type === 'song' && embedId && (
          <div className="aspect-video w-full overflow-hidden rounded-md border border-border">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${embedId}`}
              title={post.title || "YouTube video player"}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}
      </div>

      {/* Post Footer */}
      {!isRefuelPost && (
        <div className="mt-4 flex items-center justify-between pl-1">
          <LikeButton post={post} isLoggedIn={isLoggedIn} />
          <FlagButton postId={post.id} isLoggedIn={isLoggedIn} />
        </div>
      )}
    </div>
  );
}