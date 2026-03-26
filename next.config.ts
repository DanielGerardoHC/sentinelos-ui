import type { NextConfig } from "next";

const isExport = process.env.BUILD_MODE === 'export';

const nextConfig: NextConfig = {
    output: isExport ? 'export' : 'standalone',

    trailingSlash: isExport ? true : false,

    rewrites: isExport ? undefined : async () => {
        return [
            {
                source: '/api/:path*',
                destination: 'http://127.0.0.1:8080/api/:path*'
            }
        ];
    },
};

export default nextConfig;