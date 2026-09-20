import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // better-sqlite3 is a native addon; it must stay a real require at runtime
  // rather than being bundled into the server build.
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    // Next 16 defaults `qualities` to [75]; anything else must be listed here.
    qualities: [75, 90],
  },
}

export default nextConfig
