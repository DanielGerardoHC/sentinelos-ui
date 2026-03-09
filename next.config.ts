import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    output: 'standalone',
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://10.30.35.15:8080/api/:path*'
            }
        ];
    },
};

export default nextConfig;
