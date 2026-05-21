import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
    ],
  },
  output: 'standalone',
  transpilePackages: ['motion'],
  webpack: (config, {dev, isServer, webpack}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    if (!isServer) {
        config.plugins.push(
          new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: any) => {
            resource.request = resource.request.replace(/^node:/, '');
          })
        );
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
