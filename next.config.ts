import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: '/sw.js',
      headers: [{ key: 'Service-Worker-Allowed', value: '/' }],
    },
  ],
};

export default nextConfig;
