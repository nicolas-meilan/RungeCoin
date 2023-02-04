import { NativeModules, Platform } from 'react-native';

const getDeviceLocale = (): string => (
  Platform.OS === 'ios'
    ? NativeModules.SettingsManager.settings.AppleLocale || NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
    : NativeModules.I18nManager.localeIdentifier
);

export { getDeviceLocale };
