/** @type {import('next').NextConfig} */
const nextConfig = {
  // standalone: minimal Node.js server bundle for Docker/container deployments
  output: 'standalone',
  images: {
    // Image optimization requires a running Node.js server; disable for standalone
    unoptimized: true,
  },
}

export default nextConfig
