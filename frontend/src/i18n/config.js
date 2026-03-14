import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Direct imports to eliminate network fetch delay (Render Delay in Lighthouse)
import enTranslation from './en.json';
import frTranslation from './fr.json';
import arTranslation from './ar.json';

const resources = {
  en: { translation: enTranslation },
  fr: { translation: frTranslation },
  ar: { translation: arTranslation },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr', 'ar'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

// Apply RTL direction on init
const applyDirection = (lang) => {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lang);
};

applyDirection(i18n.language);

i18n.on('languageChanged', (lang) => {
  applyDirection(lang);
});

export default i18n;
