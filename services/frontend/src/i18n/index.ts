import { createI18n } from 'vue-i18n'

const localeModules = import.meta.glob<{ default: Record<string, any> }>('./locales/*.ts', {
  eager: true,
})
const messages: Record<string, any> = {}

for (const path in localeModules) {
  const localeName = path.match(/\.\/locales\/(.+)\.ts$/)?.[1]
  if (localeName && localeModules[path]) {
    messages[localeName] = localeModules[path].default
  }
}

export const SUPPORTED_LOCALES = Object.keys(messages)
export const DEFAULT_LOCALE = 'en'
export type Locale = (typeof SUPPORTED_LOCALES)[number]
const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages,
})

export default i18n
