import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n.ts')

const nextConfig: NextConfig = {
  env: {
    API_BASE_URL: process.env.API_BASE_URL || '/justin/api',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/justin/api',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: '/home/justin/.openclaw/workspace/tcm_ai/vercel_tcm_frontend',
  },
}

export default withNextIntl(nextConfig)
