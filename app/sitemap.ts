import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { i18n } from '@/locales/config';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lightmyfire.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [];

  // Static pages for all locales
  const staticPages = [
    '',           // Home page
    '/find',      // Find a lighter
    '/save-lighter',
    '/my-profile',
    '/how-it-works',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
  ];

  // Add static pages for all locales
  for (const locale of i18n.locales) {
    for (const page of staticPages) {
      urls.push({
        url: `${SITE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : 0.8,
      });
    }
  }

  // Fetch all lighters from database
  try {
    // Create admin client to fetch all lighters (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Fetch all lighters with their updated_at timestamps
    const { data: lighters, error } = await supabaseAdmin
      .from('lighters')
      .select('pin, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching lighters for sitemap:', error);
    } else if (lighters) {
      // Add lighter detail pages for all locales
      for (const lighter of lighters) {
        for (const locale of i18n.locales) {
          urls.push({
            url: `${SITE_URL}/${locale}/lighter/${lighter.pin}`,
            lastModified: lighter.updated_at ? new Date(lighter.updated_at) : new Date(),
            changeFrequency: 'daily',
            priority: 0.7,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return urls;
}
