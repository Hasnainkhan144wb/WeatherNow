import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import urTranslation from './locales/ur.json';

const savedLanguage = typeof window !== 'undefined'
  ? localStorage.getItem('weathernow_language') || 'en'
  : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      ur: { translation: urTranslation }
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

if (typeof document !== 'undefined') {
  document.documentElement.dir = savedLanguage === 'ur' ? 'rtl' : 'ltr';
  document.documentElement.lang = savedLanguage;
}

export default i18n;
