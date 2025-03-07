/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias['@/firebase'] = './src/firebase';
    return config;
  }
};

module.exports = nextConfig; 