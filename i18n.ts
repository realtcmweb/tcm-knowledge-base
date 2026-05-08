import { getRequestConfig } from 'next-intl/server'

export const locales = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'pt', 'es'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'zh-TW'

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale || defaultLocale
  
  if (!locales.includes(locale as Locale)) {
    return {
      locale: defaultLocale,
      messages: (await import(`./messages/${defaultLocale}.json`)).default
    }
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  }
})
