'use client';

import { DetailedPost } from '@/lib/types'; // Assuming lib is at root
import LikeButton from './LikeButton';
import FlagButton from './FlagButton';
import {
  ChatBubbleBottomCenterTextIcon,
  MusicalNoteIcon,
  PhotoIcon,
  MapPinIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import React from 'react'; // Import React for IconComponent type
import Image from 'next/image';

// Helper function to get YouTube embed ID
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
        console.error("Error parsing YouTube URL:", error);
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
  // REMOVED the diagnostic line: return <FireIcon ... />;

  let embedId: string | null = null;
  if (post.post_type === 'song' && post.content_url) {
    embedId = getYouTubeEmbedId(post.content_url);
  }

  const IconComponent = iconMap[post.post_type] || ChatBubbleBottomCenterTextIcon;
  const isRefuelPost = post.post_type === 'refuel';

  return (
    // Apply conditional border color classes directly using ternaries
    <div className={`
      relative rounded-lg border border-border overflow-hidden
      ${isRefuelPost 
        ? 'bg-muted shadow-none border-l-2' 
        : 'bg-background shadow-md border-l-4'
      }
      ${post.post_type === 'text' ? 'border-post-text' : ''}
      ${post.post_type === 'image' ? 'border-post-image' : ''}
      ${post.post_type === 'location' ? 'border-post-location' : ''}
      ${post.post_type === 'song' ? 'border-post-song' : ''}
      ${post.post_type === 'refuel' ? 'border-post-refuel' : ''}
      ${!post.post_type ? 'border-border' : ''} /* Fallback border */
      ${isRefuelPost ? 'py-3 pl-4 pr-5' : 'py-5 pl-5 pr-5'}
    `}>

      {/* Post Header */}
      <div className={`mb-3 flex items-center justify-between ${isRefuelPost ? 'mb-2' : 'mb-4'}`}>
        <div className="flex items-center gap-2">
           {/* Apply conditional icon color classes directly using ternaries */}
           <IconComponent
             className={`
               h-5 w-5
               ${post.post_type === 'text' ? 'text-post-text' : ''}
               ${post.post_type === 'image' ? 'text-post-image' : ''}
               ${post.post_type === 'location' ? 'text-post-location' : ''}
               ${post.post_type === 'song' ? 'text-post-song' : ''}
               ${post.post_type === 'refuel' ? 'text-post-refuel' : 'text-muted-foreground'}
             `}
             aria-hidden="true"
           />
           <span className="font-semibold text-foreground">{post.username}</span>
           {post.show_nationality && post.nationality && (
              <Image
                src={`/flags/${post.nationality.toLowerCase()}.png`}
                alt={post.nationality}
                width={20}
                height={15}
                className="ml-1.5"
                title={post.nationality}
              />
            )}
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
          <p className={`
            font-semibold
            text-post-refuel
          `}>
             Refueled! This lighter&apos;s journey continues.
          </p>
        )}

        {post.post_type === 'image' && post.content_url && (
          <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border">
            <Image
              src={post.content_url}
              alt={post.title || 'User upload'}
              fill
              className="object-cover"
            />
          </div>
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
        {post.post_type === 'song' && post.content_url && !embedId && (
            <p className="text-sm text-post-song italic">Could not load YouTube video (invalid URL?).</p>
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
