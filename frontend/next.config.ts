import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ads-partners.coupang.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'thumbnail*.coupangcdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.coupangcdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image*.coupangcdn.com',
        port: '',
        pathname: '/**',
      },
      {                                                                                                                                                                                                                                                        
        protocol: 'https',                                                                                                                                                                                                                                     
        hostname: 'images.unsplash.com',                                                                                                                                                                                                                        
        port: '',                                                                                                                                                                                                                                             
        
        pathname: '/**',                                                                                                                                                                                                                                        
      }   
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 클라이언트 사이드에서 Node.js 모듈을 처리
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        'node:async_hooks': false,
        'node:events': false,
        'node:util': false,
        'node:buffer': false,
        'node:process': false,
        'node:path': false,
        'node:fs': false,
        'node:os': false,
        'node:url': false,
        'node:querystring': false,
        'node:stream': false,
        'node:http': false,
        'node:https': false,
        'node:net': false,
        'node:tls': false,
        'node:crypto': false,
        'node:zlib': false,
        'node:assert': false,
      };
    }
    return config;
  },
};

export default nextConfig;
