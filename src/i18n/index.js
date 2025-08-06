import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import en from './locales/en.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import it from './locales/it.json';
import nl from './locales/nl.json';
import ko from './locales/ko.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import ar from './locales/ar.json';
import tr from './locales/tr.json';
import hi from './locales/hi.json';

const resources = {
  English: { translation: en },
  Chinese: { translation: zh },
  Japanese: { translation: ja },
  Spanish: { translation: es },
  French: { translation: fr },
  German: { translation: de },
  Italian: { translation: it },
  Dutch: { translation: nl },
  Korean: { translation: ko },
  Portuguese: { translation: pt },
  Russian: { translation: ru },
  Arabic: { translation: ar },
  Turkish: { translation: tr },
  Hindi: { translation: hi },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'English', // default language
    fallbackLng: 'English',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Disable suspense for better compatibility
    },
  });

// Function to change language
export const changeLanguage = (language) => {
  i18n.changeLanguage(language);
};

export default i18n; 