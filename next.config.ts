import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // WDK menarik sodium-universal → sodium-native (addon Node).
      // Di browser kita paksa implementasi JS murni.
      "sodium-native": "sodium-javascript",
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: require.resolve("buffer/"),
      crypto: false,
      fs: false,
      path: false,
      stream: false,
    };
    return config;
  },
};

export default nextConfig;
