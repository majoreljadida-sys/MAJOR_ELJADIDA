/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000'] },
  },
}

module.exports = nextConfig
