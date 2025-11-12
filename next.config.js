

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.youtube.com https://www.google.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https: blob:;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' https://*.supabase.co https://api.openai.com https://js.stripe.com https://www.youtube.com https://nominatim.openstreetmap.org;
  frame-src https://js.stripe.com https://www.youtube.com https://www.openstreetmap.org;
  media-src 'self' https:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig = {
  env: {
    NEXT_PUBLIC_VERCEL_URL: process.env.VERCEL_URL,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
    ],
  },

  webpack: (config, { isServer }) => {
    // Handle @napi-rs/canvas for Vercel serverless environment
    // Externalize it so webpack doesn't try to bundle the .node binaries
    if (isServer) {
      config.externals.push('@napi-rs/canvas');
    }

    return config;
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)'
          },
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig;