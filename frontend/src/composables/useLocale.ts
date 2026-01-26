import { useI18n } from 'vue-i18n'

export function useLocale() {
  const { locale, t } = useI18n()

  const setLocale = (lang: 'en' | 'zh') => {
    locale.value = lang
    localStorage.setItem('locale', lang)
  }

  const toggleLocale = () => {
    const newLocale = locale.value === 'en' ? 'zh' : 'en'
    setLocale(newLocale)
  }

  return {
    locale,
    t,
    setLocale,
    toggleLocale
  }
}
