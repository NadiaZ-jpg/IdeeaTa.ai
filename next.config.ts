import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },

  output: 'standalone',
  transpilePackages: ['motion'],

  turbopack: {
    root: "./",
  },

  async rewrites() {
    return [
      {
        source: '/__/auth/:path*',
        destination: 'https://ideeata.firebaseapp.com/__/auth/:path*',
      },
    ];
  },

  webpack: (config, { dev, isServer, webpack }) => {
    // 1. Dezactivare HMR
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = { ignored: /.*/ };
    }

    // 2. Neutralizare erori dependențe critice
    config.ignoreWarnings = [/Critical dependency/];

    if (!isServer) {
      // 3. Aliasing forțat pentru a neutraliza protobufjs în browser
      config.resolve.alias = {
        ...config.resolve.alias,
        'protobufjs': false,
        'protobufjs/google/protobuf/api.json': false,
        'protobufjs/google/protobuf/descriptor.json': false,
        'protobufjs/google/protobuf/source_context.json': false,
        'protobufjs/google/protobuf/type.json': false,
      };

      // 4. NormalModuleReplacementPlugin pentru modulele node
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: any) => {
          resource.request = resource.request.replace(/^node:/, '');
        })
      );

      // 5. Fallbacks pentru modulele Node.js care nu există în browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        https: false,
        path: false,
        crypto: false,
        os: false,
        stream: false,
        http: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
};

export default nextConfig;