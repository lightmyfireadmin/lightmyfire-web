
/**
 * Represents a comprehensive post object including joined user and lighter information.
 * This type maps to the `detailed_posts` view or enriched query results.
 */
export type DetailedPost = {
  /** The unique identifier of the post. */
  id: number;
  /** The UUID of the lighter associated with this post. */
  lighter_id: string;
  /** The UUID of the user who created the post. */
  user_id: string;
  /** The timestamp when the post was created (ISO 8601). */
  created_at: string;
  /** The type of content in the post. */
  post_type: 'text' | 'image' | 'song' | 'location' | 'refuel';
  /** The title of the post (optional). */
  title: string | null;
  /** The text content of the post (optional). */
  content_text: string | null;
  /** URL to media content (e.g., image URL, song link) (optional). */
  content_url: string | null;
  /** The name of the location (e.g., city, venue) (optional). */
  location_name: string | null;
  /** The latitude of the location (optional). */
  location_lat: number | null;
  /** The longitude of the location (optional). */
  location_lng: number | null;
  /** Indicates if this post marks the lighter as being 'found' in a new location. */
  is_find_location: boolean;
  /** Indicates if this post represents the creation of the lighter. */
  is_creation: boolean;
  /** Indicates if the user chose to post anonymously. */
  is_anonymous: boolean;
  /** Indicates if the post is pinned to the top of the feed. */
  is_pinned: boolean;
  /** The username of the poster (resolved from profiles). */
  username: string;
  /** The total number of likes on this post. */
  like_count?: number;
  /** Indicates if the current user has liked this post. */
  user_has_liked?: boolean;
  /** The nationality code of the poster (optional). */
  nationality: string | null;
  /** Indicates if the user's nationality should be displayed. */
  show_nationality: boolean;
  /** The role of the user (e.g., 'admin', 'moderator'). */
  role?: 'user' | 'moderator' | 'admin' | null;
  /** Indicates if the post is visible to the public. */
  is_public: boolean;
  /** Indicates if the post has been flagged for moderation. */
  is_flagged: boolean;
  /** The number of times this post has been flagged. */
  flagged_count: number;
};

/**
 * Represents a user's post joined with minimal lighter details.
 * Used for listing a user's own posts in their profile.
 */
export type MyPostWithLighter = {
  /** The unique identifier of the post. */
  id: number;
  /** The title of the post (optional). */
  title: string | null;
  /** The type of content in the post. */
  post_type: string;
  /** The timestamp when the post was created. */
  created_at: string;
  /** The UUID of the associated lighter. */
  lighter_id: string;
  /** Nested object containing the lighter's name. */
  lighters: {
    /** The name of the lighter. */
    name: string;
  } | null;
};

/**
 * Represents a trophy or achievement available in the system.
 */
export type Trophy = {
  /** The unique identifier of the trophy. */
  id: number;
  /** The display name of the trophy. */
  name: string;
  /** A description of how the trophy is earned. */
  description: string;
  /** The filename of the icon associated with the trophy (optional). */
  icon_name: string | null;
};
