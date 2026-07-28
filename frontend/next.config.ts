import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  turbopack: {
    root: path.join(__dirname, '..'),
  }
};

export default withNextIntl(nextConfig);
