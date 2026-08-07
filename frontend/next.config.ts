import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  transpilePackages: ["@app/validations", "@app/types"]
};

export default withNextIntl(nextConfig);
