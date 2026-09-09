import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost", "0.0.0.0"],
  serverExternalPackages: ["@anthropic-ai/claude-agent-sdk"],
}

export default nextConfig
