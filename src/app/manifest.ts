import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Choon',
    short_name: 'Choon',
    description: 'Mobile-first live music app for fans, artists, and venues.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0d12',
    theme_color: '#0b0d12',
    icons: [
      { src: '/choon-logo.svg', sizes: '192x192', type: 'image/svg+xml' },
      { src: '/choon-logo.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
  };
}
