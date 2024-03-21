/** @type {import('next').NextConfig} */
const nextConfig = {
    redirects: () => [
        {
            source: '/',
            destination: '/home',
            permanent: true,
        }
    ],
    experimental: {
        instrumentationHook: true,
    }
};

export default nextConfig;
