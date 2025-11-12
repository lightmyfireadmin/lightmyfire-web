/**
 * SEO Metadata Utilities
 * Generates locale-aware metadata for pages
 */

import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lightmyfire.app';

interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
}

/**
 * Generate metadata for a page with locale support
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
 * Generate metadata for lighter detail pages
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
 * Map locale codes to OpenGraph locale format
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
 * Locale-specific metadata content
 * Can be expanded with translations
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
