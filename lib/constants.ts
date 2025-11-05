/**
 * Shared Constants
 * Centralized location for magic strings and configuration values
 */

// Supabase
export const SUPABASE_STORAGE_BUCKETS = {
  POST_IMAGES: 'post-images',
} as const;

// RPC Function Names
export const RPC_FUNCTIONS = {
  GET_LIGHTER_ID_FROM_PIN: 'get_lighter_id_from_pin',
  CREATE_NEW_LIGHTER: 'create_new_lighter',
  CREATE_NEW_POST: 'create_new_post',
  TOGGLE_LIKE: 'toggle_like',
  FLAG_POST: 'flag_post',
} as const;

// File Upload Configuration
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 2,
  MAX_SIZE_BYTES: 2 * 1024 * 1024,
  ACCEPTED_TYPES: ['image/png', 'image/jpeg', 'image/gif'],
  ACCEPTED_EXTENSIONS: ['.png', '.jpg', '.jpeg', '.gif'],
} as const;

// Post Types
export const POST_TYPES = {
  TEXT: 'text',
  SONG: 'song',
  IMAGE: 'image',
  LOCATION: 'location',
  REFUEL: 'refuel',
} as const;

// PIN Configuration
export const PIN_CONFIG = {
  PATTERN: /[^a-zA-Z0-9]/g,
  MAX_LENGTH: 6,
  DISPLAY_FORMAT_MAX_LENGTH: 7, // "ABC-123"
  HYPHEN_POSITION: 3,
} as const;

// YouTube Configuration
export const YOUTUBE_CONFIG = {
  API_ENDPOINT: '/api/youtube-search',
  MAX_RESULTS: 5,
  SUPPORTED_DOMAINS: ['youtube.com', 'www.youtube.com', 'youtu.be'],
} as const;

// User Roles
export const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
} as const;

// Default Values
export const DEFAULTS = {
  LANGUAGE: 'en',
  ITEMS_PER_PAGE: 10,
} as const;

// Sticker Pack Pricing (in cents)
export const PACK_PRICING = {
  10: 720,  // €7.20 for 10 stickers (1 sheet)
  20: 1440, // €14.40 for 20 stickers (2 sheets)
  50: 3600, // €36.00 for 50 stickers (5 sheets)
} as const;

// Valid pack sizes
export const VALID_PACK_SIZES = [10, 20, 50] as const;
export type PackSize = typeof VALID_PACK_SIZES[number];
