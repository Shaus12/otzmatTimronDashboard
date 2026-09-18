import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Avoid picking a parent lockfile as the workspace root on this machine.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
