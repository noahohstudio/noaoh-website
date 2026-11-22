import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
  // BoomLoom's page moved when it lost "Looms" from its name (Noah, Nov 21: "Boomloom Looms should be reworded just to
  // Boomloom, on all fronts"), so links to the old address still land on it
  async redirects() {
    return [{ source: "/work/boom-loom-looms", destination: "/work/boomloom", permanent: true }];
  },
};

export default nextConfig;
