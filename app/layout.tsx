import type { Metadata } from 'next';
import './globals.css';
import SetHtmlLang from '@/app/components/SetHtmlLang';

export const metadata: Metadata = {
  title: 'LightMyFire',
  description: 'A human creativity mosaic.',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/webclip.png' },
  ],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="body-with-bg max-w-full overflow-x-hidden">
        <SetHtmlLang />
        {children}
      </body>
    </html>
  );
}
