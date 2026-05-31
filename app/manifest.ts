import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cardiodigital',
    short_name: 'Cardiodigital',
    description: 'Guías y calculadoras de Cardiología y Emergentología para guardia',
    start_url: '/guias',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    orientation: 'portrait',
    categories: ['medical', 'productivity'],
    icons: [
      { src: '/logo.png', sizes: '192x192', type: 'image/png' },
      { src: '/logo.png', sizes: '512x512', type: 'image/png' },
      { src: '/logo.png', sizes: 'any', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
