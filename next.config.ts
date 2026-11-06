import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // Abaikan peringatan tanda petik ESLint saat proses build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;