// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Expose Vercel URL to the client-side
  env: {
    NEXT_PUBLIC_VERCEL_URL: process.env.VERCEL_URL,
  },

  // --- AJOUT DE CE BLOC ---
  i18n: {
    /**
     * Toutes les langues que votre site supportera.
     * L'erreur était sur /en, donc nous devons inclure 'en'.
     */
    locales: ['en', 'fr'], // J'ai ajouté 'fr' au cas où

    /**
     * La langue par défaut. 
     * Quand un utilisateur visite "/", c'est la langue qui sera utilisée.
     */
    defaultLocale: 'en',
  },
  // --- FIN DU BLOC AJOUTÉ ---
};

module.exports = nextConfig;