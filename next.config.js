/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@nomicfoundation/hardhat-toolbox'],
  },
};

module.exports = nextConfig;
