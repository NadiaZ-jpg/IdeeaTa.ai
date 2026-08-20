import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'IdeeaTa.ai - AI Business Plan Generator',
    short_name: 'IdeeaTa.ai',
    description: 'Generator inteligent de planuri de afaceri cu inteligență artificială',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
