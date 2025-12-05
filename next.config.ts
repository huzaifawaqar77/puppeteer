import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Docker & Production Optimization
  output: "standalone",

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.unsplash.com",
      },
    ],
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  // Headers for security and caching
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=60, s-maxage=120",
          },
        ],
      },
      {
        source: "/public/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
