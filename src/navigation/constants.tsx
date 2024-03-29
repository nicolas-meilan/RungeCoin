import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

export const screenOptions: NativeStackNavigationOptions = { headerShown: false };

export enum ScreenName {
  // Start Stack
  welcome = 'welcome',
  startGuide = 'startGuide',
  obtainAccess = 'obtainAccess',
  createSeedPhrase = 'createSeedPhrase',
  passwordForHwConnection = 'passwordForHwConnection',
  connectWithHw = 'connectWithHw',

  // Main Stack
  validateAccess = 'validateAccess',
  home = 'home',
  send = 'send',
  token = 'token',
  tx = 'tx',
  configuration = 'configuration',
}