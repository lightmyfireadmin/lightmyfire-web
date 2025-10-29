// CE FICHIER EST app/layout.tsx (Le VRAI Layout Racine)
import type { Metadata } from 'next';
import { Poppins, Nunito_Sans } from 'next/font/google';
// Importer le CSS global ici
import './globals.css';

// Configuration des polices
const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: '700',
  variable: '--font-poppins',
});

const nunito_sans = Nunito_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700'],
  variable: '--font-nunito-sans',
});

// Métadonnées
export const metadata: Metadata = {
  title: 'LightMyFire',
  description: 'A human creativity mosaic.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ce layout racine DOIT contenir <html> et <body>
  return (
    // Note : lang={locale} est géré par app/[lang]/layout.tsx,
    // mais nous mettons les polices ici.
    <html lang="en" className={`${poppins.variable} ${nunito_sans.variable}`}>
      <head>
        {/* Les liens de polices sont gérés par next/font */}
      </head>
      {/* Les classes de layout (flex, etc.) sont appliquées ici, 
        sur le <body> principal.
      */}
      <body className="flex flex-col min-h-screen body-with-bg font-sans">
        {/* 'children' sera le layout app/[lang]/layout.tsx, 
          qui contient le Header, le Footer, et le contenu de la page.
        */}
        {children}
      </body>
    </html>
  );
}
