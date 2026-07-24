import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: '/Users/janakshrestha/Documents/2026/07July/premium-law-firm',
  }
};

export default withNextIntl(nextConfig);
