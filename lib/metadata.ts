/**
 * SEO Metadata Utilities
 * Generates locale-aware metadata for pages to enhance Search Engine Optimization (SEO)
 * and social media sharing previews.
 */

import { Metadata } from 'next';

/** Base URL of the site, defaults to 'https://lightmyfire.app' if not set in environment. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lightmyfire.app';

/**
 * Interface representing the basic metadata requirements for a page.
 */
interface PageMetadata {
  /** The title of the page. */
  title: string;
  /** A short description of the page content. */
  description: string;
  /** Optional array of keywords relevant to the page. */
  keywords?: string[];
  /** Optional URL to an image to be used for social media previews. */
  image?: string;
  /** Optional relative URL path for the page (e.g., '/about'). */
  url?: string;
  /** The OpenGraph type of the content (default: 'website'). */
  type?: 'website' | 'article' | 'profile';
}

/**
 * Generates a comprehensive Next.js Metadata object with locale support.
 * This function constructs OpenGraph and Twitter card metadata based on the provided page data.
 *
 * @param {string} locale - The current locale code (e.g., 'en', 'fr').
 * @param {PageMetadata} pageData - The specific metadata for the page.
 * @returns {Metadata} A populated Next.js Metadata object ready for export.
 */
export function generatePageMetadata(
  locale: string,
  pageData: PageMetadata
): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = '/illustrations/around_the_world.png',
    url = '',
    type = 'website',
  } = pageData;

  const fullUrl = `${SITE_URL}/${locale}${url}`;
  const fullImageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: 'LightMyFire',
      images: [
        {
          url: fullImageUrl,
          width: 800,
          height: 600,
          alt: title,
        },
      ],
      locale: getOpenGraphLocale(locale),
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [fullImageUrl],
      creator: '@lightmyfire',
      site: '@lightmyfire',
    },
    alternates: {
      canonical: fullUrl,
    },
  };
}

/**
 * specialized metadata generator for lighter detail pages.
 * Formats the title and description based on the lighter's specific attributes.
 *
 * @param {string} locale - The current locale code.
 * @param {object} lighterData - The data object containing lighter details.
 * @param {string} lighterData.pin - The unique PIN of the lighter.
 * @param {string} [lighterData.name] - The display name of the lighter.
 * @param {string} [lighterData.owner_name] - The name of the user who owns the lighter.
 * @param {string} [lighterData.story] - The backstory or description of the lighter.
 * @param {string} [lighterData.image_url] - URL to the lighter's image.
 * @param {number} [lighterData.post_count] - Total number of posts associated with the lighter.
 * @returns {Metadata} A populated Next.js Metadata object for the lighter page.
 */
export function generateLighterMetadata(
  locale: string,
  lighterData: {
    pin: string;
    name?: string;
    owner_name?: string;
    story?: string;
    image_url?: string;
    post_count?: number;
  }
): Metadata {
  const { pin, name, owner_name, story, image_url, post_count = 0 } = lighterData;

  const lighterName = name || `Lighter ${pin}`;
  const title = `${lighterName} - ${owner_name || 'LightSaver'}`;
  const description =
    story ||
    `Discover the story of ${lighterName}, saved by ${owner_name || 'a LightSaver'}. Join the journey with ${post_count} posts on LightMyFire.`;

  return generatePageMetadata(locale, {
    title,
    description,
    image: image_url || '/illustrations/around_the_world.png',
    url: `/lighter/${pin}`,
    type: 'article',
    keywords: ['lighter', 'story', 'sustainability', lighterName, pin],
  });
}

/**
 * Maps a simple locale code (e.g., 'en') to a full OpenGraph locale string (e.g., 'en_US').
 *
 * @param {string} locale - The 2-letter or 5-letter locale code used in the app.
 * @returns {string} The corresponding OpenGraph locale format, defaulting to 'en_US' if unknown.
 */
function getOpenGraphLocale(locale: string): string {
  const localeMap: Record<string, string> = {
    en: 'en_US',
    ar: 'ar_AR',
    de: 'de_DE',
    es: 'es_ES',
    fa: 'fa_IR',
    fr: 'fr_FR',
    hi: 'hi_IN',
    id: 'id_ID',
    it: 'it_IT',
    ja: 'ja_JP',
    ko: 'ko_KR',
    mr: 'mr_IN',
    nl: 'nl_NL',
    pl: 'pl_PL',
    pt: 'pt_BR',
    ru: 'ru_RU',
    te: 'te_IN',
    th: 'th_TH',
    tr: 'tr_TR',
    uk: 'uk_UA',
    ur: 'ur_PK',
    vi: 'vi_VN',
    'zh-CN': 'zh_CN',
  };

  return localeMap[locale] || 'en_US';
}

/**
 * Predefined localized metadata for static pages.
 * Use this object to retrieve titles and descriptions for common pages based on locale.
 */
export const localizedMetadata = {
  home: {
    en: {
      title: 'LightMyFire - Save Lighters, Share Stories',
      description:
        'A global movement to save lighters and share their stories. Join thousands creating a human mosaic of creativity while fighting waste.',
      keywords: ['lighter', 'sustainability', 'storytelling', 'community', 'creativity'],
    },
    // Add more locales as needed
  },
  find: {
    en: {
      title: 'Find a Lighter - Discover Stories',
      description:
        'Enter a PIN to discover the story behind a lighter. Explore the journey of saved lighters from around the world.',
      keywords: ['find lighter', 'PIN', 'lighter story', 'discover'],
    },
  },
  save: {
    en: {
      title: 'Save a Lighter - Become a LightSaver',
      description:
        'Join the movement! Save a lighter, create its story, and become part of the global creativity mosaic.',
      keywords: ['save lighter', 'lightsaver', 'sustainability', 'create'],
    },
  },
  about: {
    en: {
      title: 'About LightMyFire - Our Mission',
      description:
        'Learn about LightMyFire, a global movement transforming waste into art through saved lighters and shared stories.',
      keywords: ['about', 'mission', 'sustainability', 'community'],
    },
  },
  profile: {
    en: {
      title: 'My Profile - LightMyFire',
      description: 'View your saved lighters, posts, and contributions to the global creativity mosaic.',
      keywords: ['profile', 'my lighters', 'posts'],
    },
  },
};
