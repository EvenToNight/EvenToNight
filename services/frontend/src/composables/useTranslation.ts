import { useI18n } from 'vue-i18n'

export const useScopedTranslation = (prefix: string) => {
  const { t: translate, locale, ...rest } = useI18n()

  const t = (key: string, ...args: any[]): string => {
    return translate(`${prefix}.${key}`, ...(args as [any?, any?]))
  }

  return {
    t,
    locale,
    ...rest,
  }
}

export const useTranslation = useScopedTranslation
