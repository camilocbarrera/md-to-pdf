/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: [
      'react-markdown',
      'react-syntax-highlighter',
      'mermaid',
      '@monaco-editor/react',
      'lucide-react'
    ],
  },
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  // Bundle analyzer for optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize for mobile by reducing bundle size
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'react-syntax-highlighter/dist/esm/styles': 'react-syntax-highlighter/dist/esm/styles/prism',
      };
    }
    return config;
  },
};

export default nextConfig;
