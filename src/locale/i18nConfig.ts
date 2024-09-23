import '@formatjs/intl-locale/polyfill';
import '@formatjs/intl-pluralrules/polyfill';
import '@formatjs/intl-pluralrules/locale-data/en';
import '@formatjs/intl-pluralrules/locale-data/es';

import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import es from './es.json';
import { getDeviceLocale } from '@system/deviceInfo';
import StorageKeys from '@system/storageKeys';

export enum Languages {
  ES = 'es',
  EN = 'en',
}

const LanguageLocale = {
  ...Languages,
  FROM_DEVICE: 'fromDevice',
};

export const defaultLocale = LanguageLocale.EN;

export type LanguageLocaleType = Exclude<typeof LanguageLocale, 'fromDevice'>;


const initializeI18nConfig = async () => {
  const storedLng = await AsyncStorage.getItem(StorageKeys.LANGUAGE);

  const deviceLocale = getDeviceLocale().split('_')[0];
  const baseLng = Object.values(LanguageLocale).includes(deviceLocale)
    ? deviceLocale : defaultLocale;

  const lng = storedLng ? storedLng : baseLng;

  await i18next.use(initReactI18next).init({
    lng,
    resources: {
      [LanguageLocale.EN]: { translation: en },
      [LanguageLocale.ES]: { translation: es },
    },
    fallbackLng: defaultLocale,
  });
};

export const changeLanguage = async (newLanguage: Languages) => {
  await Promise.all([
    i18next.changeLanguage(newLanguage),
    AsyncStorage.setItem(StorageKeys.LANGUAGE, newLanguage),
  ]);
};

export default initializeI18nConfig;
