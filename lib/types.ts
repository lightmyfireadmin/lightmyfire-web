// lib/types.ts

// Main Post type, used by Lighter Page, Homepage, Profile Page
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
  like_count: number;
  user_has_liked: boolean;
  nationality: string | null;
  show_nationality: boolean;
  role?: 'user' | 'moderator' | 'admin' | null;
  // Champs ajoutés pour la synchronisation
  is_public: boolean;
  is_flagged: boolean;
  flagged_count: number;
};

// Type specifically for the My Contributions list on the profile page
export type MyPostWithLighter = {
  id: number;
  title: string | null;
  post_type: string; // Keep as string here, could be more specific if needed
  created_at: string;
  lighter_id: string;
  lighters: { // This structure comes from the Supabase join
    name: string;
  } | null;
};

// Type for Trophies
export type Trophy = {
  id: number;
  name: string;
  description: string;
  icon_name: string | null; // Corresponds to trophy table column
};

// Add other shared types here if needed later