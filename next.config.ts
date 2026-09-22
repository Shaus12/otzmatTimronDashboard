import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Avoid picking a parent lockfile as the workspace root on this machine.
  outputFileTracingRoot: path.join(__dirname),
  // Source snapshots are private local inputs, never deployment artifacts.
  outputFileTracingExcludes: {
    "/*": ["./.local-data/**/*", "./work/**/*", "./outputs/**/*"],
  },
};

export default nextConfig;
