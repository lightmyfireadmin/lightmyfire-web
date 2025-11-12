/**
 * Schema.org Structured Data (JSON-LD)
 * Helps search engines understand the site structure and content
 */

export default function StructuredData() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lightmyfire.app';

  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LightMyFire',
    url: siteUrl,
    logo: `${siteUrl}/webclip.png`,
    description: 'A global movement to save lighters and share their stories. Join thousands creating a human mosaic of creativity while fighting waste.',
    sameAs: [
      // Add social media links when available
      // 'https://twitter.com/lightmyfire',
      // 'https://facebook.com/lightmyfire',
      // 'https://instagram.com/lightmyfire',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      url: `${siteUrl}/en/contact`,
    },
  };

  // WebSite Schema with SearchAction
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LightMyFire',
    url: siteUrl,
    description: 'A global movement to save lighters and share their stories.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/en/find?pin={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  // WebApplication Schema for PWA
  const webApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'LightMyFire',
    url: siteUrl,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'A global movement to save lighters and share their stories. Join thousands creating a human mosaic of creativity while fighting waste.',
    screenshot: `${siteUrl}/illustrations/around_the_world.png`,
  };

  // CreativeWork Schema (for the mosaic concept)
  const creativeWorkSchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: 'LightMyFire Human Creativity Mosaic',
    description: 'A collaborative art project where people share stories about rescued lighters, creating a global mosaic of human creativity and sustainability.',
    creator: {
      '@type': 'Organization',
      name: 'LightMyFire',
    },
    about: [
      {
        '@type': 'Thing',
        name: 'Sustainability',
      },
      {
        '@type': 'Thing',
        name: 'Community Art',
      },
      {
        '@type': 'Thing',
        name: 'Storytelling',
      },
    ],
  };

  return (
    <>
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />

      {/* WebSite Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />

      {/* WebApplication Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationSchema),
        }}
      />

      {/* CreativeWork Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(creativeWorkSchema),
        }}
      />
    </>
  );
}
