import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const nonce = crypto.randomUUID()

    return [{
      source: '/((?!api).*)',
      headers: [
        {
          key: "X-Frame-Options",
          value: "DENY"
        },
      ]
    }]
  }
};

export default nextConfig;
