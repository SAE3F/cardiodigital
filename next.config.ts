const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/(guias|algoritmos|dosis_farmacos|calculadoras)/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'supabase-medical-data',
        expiration: { maxAgeSeconds: 604800, maxEntries: 200 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      urlPattern: /\/_next\/static\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: { maxAgeSeconds: 2592000 },
      },
    },
    {
      urlPattern: /\/calculadoras\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'calculadoras-pages',
        networkTimeoutSeconds: 3,
        expiration: { maxAgeSeconds: 86400 },
      },
    },
    {
      urlPattern: /\/guias\/.*/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'guias-pages',
        expiration: { maxAgeSeconds: 604800 },
      },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
}

module.exports = withPWA(nextConfig)
