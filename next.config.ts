import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.cloudflare.steamstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cmsassets.rgpub.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gaming-cdn.com',
        port: '',
        pathname: '/**',
      },
      // Agrega aquí cualquier otro dominio de imágenes externas que uses
    ],
  },
};

export default nextConfig;
