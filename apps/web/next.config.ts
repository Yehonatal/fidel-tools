import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'self' https://yonatanafewerk.vercel.app",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // Transpile workspace packages
  transpilePackages: ["@fidel-tools/db", "@fidel-tools/core", "@fidel-tools/lang-am"],

  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },


  // Allow server-only packages in API routes
  serverExternalPackages: ["nodemailer"],

  turbopack: {
    resolveAlias: {
      fs: "./lib/empty-stub.ts",
    },
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
