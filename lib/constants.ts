

export const SUPABASE_STORAGE_BUCKETS = {
  POST_IMAGES: 'post-images',
} as const;

export const RPC_FUNCTIONS = {
  GET_LIGHTER_ID_FROM_PIN: 'get_lighter_id_from_pin',
  CREATE_NEW_LIGHTER: 'create_new_lighter',
  CREATE_NEW_POST: 'create_new_post',
  TOGGLE_LIKE: 'toggle_like',
  FLAG_POST: 'flag_post',
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE_MB: 2,
  MAX_SIZE_BYTES: 2 * 1024 * 1024,
  ACCEPTED_TYPES: ['image/png', 'image/jpeg', 'image/gif'],
  ACCEPTED_EXTENSIONS: ['.png', '.jpg', '.jpeg', '.gif'],
} as const;

export const POST_TYPES = {
  TEXT: 'text',
  SONG: 'song',
  IMAGE: 'image',
  LOCATION: 'location',
  REFUEL: 'refuel',
} as const;

export const PIN_CONFIG = {
  PATTERN: /[^a-zA-Z0-9]/g,
  MAX_LENGTH: 6,
  DISPLAY_FORMAT_MAX_LENGTH: 7,   HYPHEN_POSITION: 3,
} as const;

export const YOUTUBE_CONFIG = {
  API_ENDPOINT: '/api/youtube-search',
  MAX_RESULTS: 5,
  SUPPORTED_DOMAINS: ['youtube.com', 'www.youtube.com', 'youtu.be'],
} as const;

export const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
} as const;

export const DEFAULTS = {
  LANGUAGE: 'en',
  ITEMS_PER_PAGE: 10,
} as const;

export const PACK_PRICING = {
  10: 720,    20: 1440,   50: 3600, } as const;

export const VALID_PACK_SIZES = [10, 20, 50] as const;
export type PackSize = typeof VALID_PACK_SIZES[number];
