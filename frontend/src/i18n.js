import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en/translation.json';
import uzTranslation from './locales/uz/translation.json';
import ruTranslation from './locales/ru/translation.json';

// Get language from localStorage or default to 'uz'
const savedLanguage = (() => {
  try {
    return localStorage.getItem('language');
  } catch {
    return null;
  }
})() || 'uz';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      uz: {
        translation: uzTranslation
      },
      ru: {
        translation: ruTranslation
      }
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

// Ensure document lang is set on initial load too
document.documentElement.lang = savedLanguage;

// Save language preference when it changes
i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem('language', lng);
  } catch {
    // ignore
  }
  document.documentElement.lang = lng;
});

export default i18n;
