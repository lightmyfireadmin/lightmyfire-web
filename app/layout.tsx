import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LightMyFire',
  description: 'A human creativity mosaic.',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/webclip.png' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="body-with-bg max-w-full overflow-x-hidden">
        <div className="px-2.5">
          {children}
        </div>
      </body>
    </html>
  );
}
