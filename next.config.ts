import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // Use remotePatterns instead of deprecated `domains` to allow external image hosts
    // See: https://nextjs.org/docs/api-reference/next/image#remote-patterns
    remotePatterns: [
      // PERMANENT SOLUTION: Allow ALL domains - no need to add URLs ever again
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },

};

export default nextConfig;
