import type { NextConfig } from "next";

const apiInternal =
  process.env.API_INTERNAL_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:4001";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@alwisam/shared-validation"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiInternal}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${apiInternal}/uploads/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
