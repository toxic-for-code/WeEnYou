/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is now stable in Next.js 14, no need for experimental flag
}

module.exports = {
  images: {
    domains: [
      'my-weenyou-uploads.s3.eu-north-1.amazonaws.com',
      // add any other domains you use for images
    ],
  },
}; 