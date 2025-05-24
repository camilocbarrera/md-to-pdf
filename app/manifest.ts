import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Markdown to PDF Converter',
    short_name: 'MD to PDF',
    description: 'Convert Markdown to PDF with live preview, syntax highlighting, and Mermaid diagrams',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#fafafa',
    orientation: 'any',
    categories: ['productivity', 'utilities', 'developer'],
    icons: [
      {
        src: '/placeholder-logo.png',
        sizes: 'any',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    screenshots: [
      {
        src: '/og-image.png',
        sizes: '1200x630',
        type: 'image/png',
        form_factor: 'wide',
      },
    ],
  }
} 