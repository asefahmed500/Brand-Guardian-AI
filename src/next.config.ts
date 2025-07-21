
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // This is to fix a warning from a genkit dependency:
    // "Module not found: Can't resolve '@opentelemetry/exporter-jaeger'"
    // We are not using Jaeger, so we can safely ignore this.
    config.resolve.alias['@opentelemetry/exporter-jaeger'] = false;
    
    // Another optional dependency that can cause warnings
    config.resolve.alias['@opentelemetry/exporter-zipkin'] = false;

    return config;
  },
};

export default nextConfig;
