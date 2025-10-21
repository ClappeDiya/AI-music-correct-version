/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Ensure middleware works correctly
  skipMiddlewareUrlNormalize: true,
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    
    return [
      // Handle API v1 requests - handles both with and without trailing slashes
      {
        source: "/api/v1/:path*/",
        destination: `${backendUrl}/api/v1/:path*/`,
      },
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*/`,
      },
      // Handle non-versioned API requests - handles both with and without trailing slashes
      {
        source: "/api/:path*/",
        destination: `${backendUrl}/api/:path*/`,
      },
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*/`,
      }
    ];
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NEXT_PUBLIC_ORIGIN || "http://localhost:3000",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
};
