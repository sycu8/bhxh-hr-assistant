import type { NextConfig } from "next";

const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@prisma/client",
    ".prisma/client",
    "postgres",
    "pg",
    "@prisma/client/wasm",
  ],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: SECURITY_HEADERS,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/cap-nhat-phap-luat",
        destination: "/legal-updates",
        permanent: false,
      },
      { source: "/bao-hiem/search", destination: "/search", permanent: false },
      { source: "/bao-hiem/hoi-dap", destination: "/hoi-dap", permanent: false },
      { source: "/bao-hiem/topics", destination: "/topics", permanent: false },
      {
        source: "/bao-hiem/legal-updates",
        destination: "/legal-updates",
        permanent: false,
      },
      {
        source: "/bao-hiem/nguon-phap-luat",
        destination: "/nguon-phap-luat",
        permanent: false,
      },
      { source: "/bao-hiem/ask-hr", destination: "/ask-hr", permanent: false },
    ];
  },
};

export default nextConfig;
