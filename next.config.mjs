/** @type {import('next').NextConfig} */
const nextConfig = {
    // Optimizaciones de rendimiento
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@prisma/client', 'lucide-react']
  },
  
  // Configuración de imágenes
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,  
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // Headers de seguridad y rendimiento
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=600'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          }
        ]
      }
    ];
  },
  
  // Configuración de compresión
  compress: true,
  
  // Configuración de logging
  logging: {
    fetches: {
      fullUrl: true
    }
  },

  // Configuración de webpack para optimización
  webpack: (config, { dev, isServer }) => {
    // Optimizaciones solo para producción
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }
    
    return config;
  },

  // Configuración de redirecciones
  async redirects() {
    return [
      {
        source: '/health',
        destination: '/api/health',
        permanent: false,
      }
    ];
  },

  // Configuración de rewrites
  async rewrites() {
    return [
      {
        source: '/api/health/simple',
        destination: '/api/health',
      }
    ];
  }
};

export default nextConfig;