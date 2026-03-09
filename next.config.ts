import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    output: 'standalone',
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://192.168.56.10:8080/api/:path*'
            }
        ];
    },
};

export default nextConfig;
