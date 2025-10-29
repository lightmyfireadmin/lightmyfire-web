/** @type {import('next').NextConfig} */
const nextConfig = {
  // Expose Vercel URL to the client-side
  env: {
    NEXT_PUBLIC_VERCEL_URL: process.env.VERCEL_URL,
  },
  
  // Il ne faut PAS ajouter de bloc 'i18n' ici.
  // La gestion des langues ('en', 'fr') est 
  // entièrement gérée par le fichier middleware.ts.
};

module.exports = nextConfig;