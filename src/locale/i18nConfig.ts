import 'intl-pluralrules';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import es from './es.json';
import { getDeviceLocale } from '@system/deviceInfo';

export enum LanguageLocale {
  ES = 'es',
  EN = 'en',
}

const defaultLocale = LanguageLocale.EN;

const initializeI18nConfig = async () => {
  const deviceLocale = getDeviceLocale().split('_')[0];

  await i18next.use(initReactI18next).init({
    lng: deviceLocale,
    resources: {
      [LanguageLocale.EN]: { translation: en },
      [LanguageLocale.ES]: { translation: es },
    },
    fallbackLng: defaultLocale,
  });
};

export default initializeI18nConfig;
