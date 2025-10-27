/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Skip static page generation errors during build
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable static page generation - force all pages to be dynamic
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig
