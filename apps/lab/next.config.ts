import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      fs: "./lib/empty-stub.ts",
      module: "./lib/empty-stub.ts",
      "node:module": "./lib/empty-stub.ts",
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
        "node:module": false,
      };
    }
    return config;
  },
};

export default nextConfig;
