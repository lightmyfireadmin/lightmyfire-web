
/**
 * Represents a detailed post object with joined information.
 */
export type DetailedPost = {
  id: number;
  lighter_id: string;
  user_id: string;
  created_at: string;
  post_type: 'text' | 'image' | 'song' | 'location' | 'refuel';
  title: string | null;
  content_text: string | null;
  content_url: string | null;
  location_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
  is_find_location: boolean;
  is_creation: boolean;
  is_anonymous: boolean;
  is_pinned: boolean;
  username: string;
  like_count?: number;
  user_has_liked?: boolean;
  nationality: string | null;
  show_nationality: boolean;
  role?: 'user' | 'moderator' | 'admin' | null;
  // Flagged/moderation fields
  is_public: boolean;
  is_flagged: boolean;
  flagged_count: number;
};

/**
 * Represents a user's post with associated lighter details.
 */
export type MyPostWithLighter = {
  id: number;
  title: string | null;
  post_type: string;
  created_at: string;
  lighter_id: string;
  lighters: {
    name: string;
  } | null;
};

/**
 * Represents a trophy/achievement.
 */
export type Trophy = {
  id: number;
  name: string;
  description: string;
  icon_name: string | null; // e.g., "trophy-gold.png"
};
