/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                // Proxy other API routes except /api/chat (handled by route.ts)
                source: '/api/:path((?!chat).*)',
                destination: 'http://backend:8000/api/:path*',
            },
        ]
    },
}

module.exports = nextConfig
