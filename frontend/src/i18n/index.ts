import { createI18n } from 'vue-i18n'
import en from './locales/en'
import zh from './locales/zh'

const messages = {
  en,
  zh
}

// Get saved locale from localStorage or default to 'en'
const savedLocale = localStorage.getItem('locale') || 'en'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages
})

export default i18n
