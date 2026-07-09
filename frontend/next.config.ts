import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const nextConfig = (phase: string): NextConfig => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  const config: NextConfig = {
    output: "export",
    reactStrictMode: false,
  };

  if (isDev) {
    config.allowedDevOrigins = ["synclastic-albertine-unindulgently.ngrok-free.dev"];
    config.experimental = {
      memoryBasedWorkersCount: true,
    };
  }

  return config;
};

export default nextConfig;
