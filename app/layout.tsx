import type { Metadata, Viewport } from 'next';
import './globals.css';
import SetHtmlLang from '@/app/components/SetHtmlLang';
import StructuredData from '@/app/components/StructuredData';

/**
 * Global metadata configuration for the application.
 * Defines default SEO tags, OpenGraph, Twitter cards, and robot directives.
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://lightmyfire.app'),
  title: {
    default: 'LightMyFire - Save Lighters, Share Stories',
    template: '%s | LightMyFire',
  },
  description: 'A global movement to save lighters and share their stories. Join thousands creating a human mosaic of creativity while fighting waste.',
  keywords: ['lighter', 'sustainability', 'storytelling', 'community', 'creativity', 'mosaic', 'save lighters', 'environmental'],
  authors: [{ name: 'LightMyFire' }],
  creator: 'LightMyFire',
  publisher: 'LightMyFire',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/webclip.png' },
  ],
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'LightMyFire',
    title: 'LightMyFire - Save Lighters, Share Stories',
    description: 'A global movement to save lighters and share their stories. Join thousands creating a human mosaic of creativity while fighting waste.',
    images: [
      {
        url: '/illustrations/around_the_world.png',
        width: 800,
        height: 600,
        alt: 'LightMyFire - A human creativity mosaic',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LightMyFire - Save Lighters, Share Stories',
    description: 'A global movement to save lighters and share their stories. Join thousands creating a human mosaic of creativity while fighting waste.',
    images: ['/illustrations/around_the_world.png'],
    creator: '@lightmyfire',
    site: '@lightmyfire',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add these values when you have them
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

/**
 * Viewport configuration for responsive design and mobile behavior.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover', // Support for notched devices (iPhone X+)
  themeColor: '#B400A3', // Matches primary color
};

/**
 * The root layout component that wraps all pages in the application.
 * It sets up the basic HTML structure, applies global styles, and includes
 * essential components like language handling and structured data.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to render inside the layout.
 * @returns {JSX.Element} The rendered root HTML structure.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="body-with-bg max-w-full overflow-x-hidden">
        <SetHtmlLang />
        <StructuredData />
        {children}
      </body>
    </html>
  );
}
