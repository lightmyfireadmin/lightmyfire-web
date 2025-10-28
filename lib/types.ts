// This is our main Post type, used by the Lighter Page and Homepage
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
    is_find_location: boolean;
    is_creation: boolean;
    is_anonymous: boolean;
    is_pinned: boolean;
    username: string;
    like_count: number;
    user_has_liked: boolean;
  };