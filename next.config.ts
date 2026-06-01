import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // unpdf (and the pdf.js build it wraps) uses Node.js features; keep it out of the
  // Server Components bundle and require it natively so PDF parsing works in Route Handlers.
  serverExternalPackages: ["unpdf"],
  // Pin the workspace root to this project (a parent lockfile exists in the home dir).
  turbopack: { root: process.cwd() },
};

export default nextConfig;
