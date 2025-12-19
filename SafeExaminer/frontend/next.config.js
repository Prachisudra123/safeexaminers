module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['example.com'], // Add your image domains here
  },
  env: {
    API_URL: process.env.API_URL, // Environment variable for API URL
  },
  webpack: (config) => {
    // Custom webpack configuration can go here
    return config;
  },
};