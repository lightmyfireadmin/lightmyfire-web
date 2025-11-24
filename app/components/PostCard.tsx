'use client';

import React from 'react';
import Image from 'next/image';
import {
  ChatBubbleBottomCenterTextIcon,
  MusicalNoteIcon,
  PhotoIcon,
  MapPinIcon,
  FireIcon
} from '@heroicons/react/24/outline';

import { DetailedPost } from '@/lib/types';
import LikeButton from './LikeButton';
import FlagButton from './FlagButton';
import ModeratorBadge from './ModeratorBadge';
import { useI18n } from '@/locales/client';
import { countryCodeToFlag, getCountryName } from '@/lib/countryToFlag';

/**
 * Extracts the YouTube video ID from a URL.
 * Supports both standard 'youtube.com' and shortened 'youtu.be' URLs.
 *
 * @param {string | null} url - The YouTube URL.
 * @returns {string | null} The video ID if found, otherwise null.
 */
function getYouTubeEmbedId(url: string | null): string | null {
    if (!url) return null;
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

/**
 * Maps post types to their corresponding HeroIcon components.
 */
const iconMap: { [key in DetailedPost['post_type']]: React.ElementType } = {
    text: ChatBubbleBottomCenterTextIcon,
    image: PhotoIcon,
    location: MapPinIcon,
    song: MusicalNoteIcon,
    refuel: FireIcon,
};

/**
 * Props for the PostCard component.
 */
interface PostCardProps {
  /** The full data object for the post to display. */
  post: DetailedPost;
  /** Indicates if the current user is logged in (enables interactions like liking). */
  isLoggedIn: boolean;
  /** If true, renders a compact version of the card suitable for smaller containers. */
  isMini?: boolean;
}

/**
 * A card component used to display a single post.
 * Supports various post types: Text, Image, Song (YouTube), Location, and Refuel.
 * Handles styling based on post type and displays user info, content, and interaction buttons.
 *
 * @param {PostCardProps} props - The component props.
 * @returns {JSX.Element} The rendered post card.
 */
function PostCard({
  post,
  isLoggedIn,
  isMini = false,
}: PostCardProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = useI18n() as any;

  // Determine display name based on user status
  const getDisplayName = () => {
    // If post was marked anonymous by user choice, show "Anonymous"
    if (post.is_anonymous) {
      return t('post.anonymous') || 'Anonymous';
    }

    // If username is null, empty, or appears deleted, show "Deleted User"
    if (!post.username || post.username.trim() === '' || post.username === 'null') {
      return t('post.deleted_user') || 'Deleted User';
    }

    // Otherwise show the actual username
    return post.username;
  };

  const displayName = getDisplayName();

  let embedId: string | null = null;
  if (post.post_type === 'song' && post.content_url) {
    embedId = getYouTubeEmbedId(post.content_url);
  }

  const IconComponent = iconMap[post.post_type] || ChatBubbleBottomCenterTextIcon;
  const isRefuelPost = post.post_type === 'refuel';

  return (

    <div className={`
      relative rounded-lg border border-border bg-background shadow-sm overflow-hidden border-l-4
      ${post.post_type === 'text' ? 'border-blue-500' : ''}
      ${post.post_type === 'image' ? 'border-green-500' : ''}
      ${post.post_type === 'location' ? 'border-yellow-500' : ''}
      ${post.post_type === 'song' ? 'border-red-500' : ''}
      ${post.post_type === 'refuel' ? 'border-orange-500' : ''}
      ${!post.post_type ? 'border-border' : ''} /* Fallback border */
      ${isMini ? 'shadow-md opacity-90' : ''}
      ${isRefuelPost ? 'py-3 pl-4 pr-5' : 'py-5 pl-5 pr-5'}
    `}>

      {/* Header: Icon, User Info, Date */}
      <div className={`mb-3 flex items-center justify-between ${isRefuelPost ? 'mb-2' : 'mb-4'}`}>
        <div className="flex items-center gap-2 flex-wrap">
           {/* Post Type Icon */}
           <IconComponent
             className={`
               ${isMini ? 'h-4 w-4' : 'h-5 w-5'}
               ${post.post_type === 'text' ? 'text-blue-600' : ''}
               ${post.post_type === 'image' ? 'text-green-600' : ''}
               ${post.post_type === 'location' ? 'text-yellow-600' : ''}
               ${post.post_type === 'song' ? 'text-red-600' : ''}
               ${post.post_type === 'refuel' ? 'text-orange-700 dark:text-orange-400' : 'text-muted-foreground'}
             `}
             aria-hidden="true"
           />
           <div className="flex items-center gap-1">
             <span className={`font-semibold ${
               post.is_anonymous || !post.username ? 'text-muted-foreground italic' : 'text-foreground'
             }`}>
               {displayName}
             </span>
             {/* Only show nationality for non-anonymous and non-deleted users */}
             {!post.is_anonymous && post.username && post.show_nationality && post.nationality && (
               <span
                 title={getCountryName(post.nationality)}
                 className="cursor-help text-lg"
               >
                 {countryCodeToFlag(post.nationality)}
               </span>
             )}
             {/* Only show moderator badge for non-anonymous and non-deleted users */}
             {!post.is_anonymous && post.username && (
               <ModeratorBadge isSmall={isMini} role={post.role ?? undefined} />
             )}
           </div>
        </div>
        <span
          className={`${isMini ? 'text-xs' : 'text-sm'} text-muted-foreground`}
          suppressHydrationWarning={true}
        >
          {new Date(post.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Content Body */}
      <div className={`space-y-4 ${isRefuelPost ? '' : 'pl-1'}`}>
        {!isRefuelPost && post.title && (
            <h3 className={`${isMini ? 'text-base' : 'text-xl'} font-bold text-foreground`}>{post.title}</h3>
        )}

        {post.post_type === 'text' && (
          <p className={`${isMini ? 'text-sm' : ''} whitespace-pre-wrap text-foreground`}>
            {post.content_text}
          </p>
        )}

        {post.post_type === 'location' && (
          <p className="text-foreground">
            {post.location_name || t('post.default_location')}
          </p>
        )}

        {isRefuelPost && (
          <p className={`
            font-semibold
            ${post.post_type === 'refuel' ? 'text-orange-700 dark:text-orange-400' : ''}
          `}>
             {t('post.refuel_message')}
          </p>
        )}

        {post.post_type === 'image' && post.content_url && (
          <div className="relative w-full rounded-md border border-border overflow-hidden">
            <Image
              src={post.content_url}
              alt={post.title || t('post.user_upload_alt')}
              width={600}
              height={400}
              className="w-full h-auto object-cover"
              priority={false}
              quality={80}
            />
          </div>
        )}

        {post.post_type === 'song' && embedId && (
          <div className="aspect-video w-full overflow-hidden rounded-md border border-border">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${embedId}`}
              title={post.title || t('post.youtube_player_title')}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}
        {post.post_type === 'song' && post.content_url && !embedId && (
            <p className="text-sm text-error italic">{t('post.youtube_load_error')}</p>
        )}
      </div>

      {/* Footer: Interactions */}
      {!isRefuelPost && (
        <div className={`mt-4 pt-3 border-t border-border ${isMini ? 'flex justify-between scale-100' : 'flex justify-between'}`}>
          <LikeButton post={post} isLoggedIn={isLoggedIn} />
          <FlagButton postId={post.id} isLoggedIn={isLoggedIn} />
        </div>
      )}
    </div>
  );
}

export default React.memo(PostCard);
