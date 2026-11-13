import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Allow the dev server's HMR websocket when opened via the LAN IP instead of localhost.
  allowedDevOrigins: ["192.168.144.1"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
