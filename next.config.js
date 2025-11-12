/** @type {import('next').NextConfig} */
module.exports = {
  // App directory is stable in Next.js 14
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'my-weenyou-uploads.s3.eu-north-1.amazonaws.com',
        pathname: '/**',
      },
      // Add additional patterns if you serve images from other hosts
      // { protocol: 'https', hostname: 'example.com', pathname: '/**' }
    ],
  },
};