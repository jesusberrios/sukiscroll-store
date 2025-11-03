import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const repoName = '/sukiscroll-store'; // nombre de tu repo en GitHub

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export', // para next export
  basePath: isProd ? repoName : '',
  assetPrefix: isProd ? repoName + '/' : '',
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
