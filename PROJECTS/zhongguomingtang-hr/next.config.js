/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { allowedOrigins: ['localhost:3000'] } },
  images: { domains: ['profile.line-scdn.net'] },
}
module.exports = nextConfig
