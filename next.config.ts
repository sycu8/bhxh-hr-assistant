import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
  async redirects() {
    return [
      {
        source: "/cap-nhat-phap-luat",
        destination: "/legal-updates",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
