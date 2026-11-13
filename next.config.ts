import type { NextConfig } from "next";

// GitHub Pages serves the site from https://azuari.github.io/toast-builder/, so production builds need a
// basePath. `npm run dev` runs with NODE_ENV=development and keeps working at the localhost root.
const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  ...(isProduction ? { basePath: "/toast-builder" } : {}),
  // Allow the dev server's HMR websocket when opened via the LAN IP instead of localhost.
  allowedDevOrigins: ["192.168.144.1"],
  // `cacheComponents` and `partialPrefetching` (PPR) are not supported with `output: "export"`; the app uses neither.
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
