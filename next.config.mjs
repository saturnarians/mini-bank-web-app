const nextConfig = {
  // Essential production settings only
  typescript: {
    ignoreBuildErrors: false, // Always check types
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-domain.com',
      },
    ],
  },
  compiler: {
    removeConsole: true,
  },
};