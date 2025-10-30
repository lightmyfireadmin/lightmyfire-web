import type { Metadata } from 'next';
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
    <div
      className="body-with-bg"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/*
        
      */}
      {children}
    </div>
  );
}

