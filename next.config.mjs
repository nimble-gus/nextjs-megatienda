/** @type {import('next').NextConfig} */
const nextConfig = {
  // appDir ya no es experimental en Next.js 15+, se removió esta línea
  images: {
    domains: ['localhost'],
    unoptimized: true, // Para desarrollo
  },
}

export default nextConfig