/**
 * Application Constants
 *
 * This file contains centralized constants used throughout the application
 * to ensure consistency and ease of maintenance.
 */

/**
 * Supabase storage bucket names.
 * Keys represent logical names, values correspond to actual bucket names in Supabase.
 */
export const SUPABASE_STORAGE_BUCKETS = {
  /** Bucket for storing images uploaded with posts. */
  POST_IMAGES: 'post-images',
} as const;

/**
 * Supabase RPC (Remote Procedure Call) function names.
 * These map to PostgreSQL functions defined in the database.
 */
export const RPC_FUNCTIONS = {
  /** Function to retrieve a lighter's ID using its PIN. */
  GET_LIGHTER_ID_FROM_PIN: 'get_lighter_id_from_pin',
  /** Function to create a new lighter record. */
  CREATE_NEW_LIGHTER: 'create_new_lighter',
  /** Function to create a new post record. */
  CREATE_NEW_POST: 'create_new_post',
  /** Function to toggle a like on a post. */
  TOGGLE_LIKE: 'toggle_like',
  /** Function to flag a post for moderation. */
  FLAG_POST: 'flag_post',
} as const;

/**
 * File upload constraints and allowed types.
 */
export const FILE_UPLOAD = {
  /** Maximum allowed file size in Megabytes. */
  MAX_SIZE_MB: 2,
  /** Maximum allowed file size in Bytes. */
  MAX_SIZE_BYTES: 2 * 1024 * 1024,
  /** Array of accepted MIME types. */
  ACCEPTED_TYPES: ['image/png', 'image/jpeg', 'image/gif'],
  /** Array of accepted file extensions. */
  ACCEPTED_EXTENSIONS: ['.png', '.jpg', '.jpeg', '.gif'],
} as const;

/**
 * Supported post types available in the application.
 */
export const POST_TYPES = {
  /** Text-based post. */
  TEXT: 'text',
  /** Music/Song sharing post. */
  SONG: 'song',
  /** Image-based post. */
  IMAGE: 'image',
  /** Location sharing post. */
  LOCATION: 'location',
  /** Post indicating a lighter refuel event. */
  REFUEL: 'refuel',
} as const;

/**
 * Configuration for PIN generation and validation.
 */
export const PIN_CONFIG = {
  /** Regex pattern to identify invalid characters (anything not alphanumeric). */
  PATTERN: /[^a-zA-Z0-9]/g,
  /** Maximum length of the raw PIN. */
  MAX_LENGTH: 6,
  /** Maximum length of the PIN when formatted (including hyphen). */
  DISPLAY_FORMAT_MAX_LENGTH: 7, // Includes hyphen
  /** Position to insert the hyphen for display. */
  HYPHEN_POSITION: 3,
} as const;

/**
 * YouTube API configuration settings.
 */
export const YOUTUBE_CONFIG = {
  /** Internal API endpoint for YouTube searches. */
  API_ENDPOINT: '/api/youtube-search',
  /** Maximum number of results to return. */
  MAX_RESULTS: 5,
  /** List of supported YouTube domains for validation. */
  SUPPORTED_DOMAINS: ['youtube.com', 'www.youtube.com', 'youtu.be'],
} as const;

/**
 * User role definitions for access control.
 */
export const USER_ROLES = {
  /** Standard user with basic privileges. */
  USER: 'user',
  /** Moderator with ability to moderate content. */
  MODERATOR: 'moderator',
  /** Administrator with full system access. */
  ADMIN: 'admin',
} as const;

/**
 * Default application settings and fallback values.
 */
export const DEFAULTS = {
  /** Default language code. */
  LANGUAGE: 'en',
  /** Default number of items to display per page. */
  ITEMS_PER_PAGE: 10,
} as const;

/**
 * Pricing configuration for sticker packs.
 * Maps pack size (number of stickers) to price in cents.
 */
export const PACK_PRICING = {
  /** Price for 10 stickers in cents ($7.20). */
  10: 720,
  /** Price for 20 stickers in cents ($14.40). */
  20: 1440,
  /** Price for 50 stickers in cents ($36.00). */
  50: 3600,
} as const;

/**
 * Array of valid sticker pack sizes.
 */
export const VALID_PACK_SIZES = [10, 20, 50] as const;

/**
 * Type definition representing valid sticker pack sizes.
 * Derived from the VALID_PACK_SIZES constant.
 */
export type PackSize = typeof VALID_PACK_SIZES[number];
