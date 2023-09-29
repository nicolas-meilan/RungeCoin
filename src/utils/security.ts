import { HASH_SALT } from '@env';
import Aes from 'react-native-aes-crypto';
import EncryptedStorage from 'react-native-encrypted-storage';
import {
  getSupportedBiometryType,
  setGenericPassword,
  getGenericPassword,
  resetGenericPassword,
  ACCESS_CONTROL,
  AUTHENTICATION_TYPE,
  STORAGE_TYPE,
  SECURITY_LEVEL,
  Options,
} from 'react-native-keychain';

import StorageKeys from '@system/storageKeys';

const ENCRYPTION_ALGORITHM = 'aes-256-cbc';

export type EncryptedData = {
  cipher: string;
  iv: string;
};

export const hashFrom = (toHash: string, useSalt: boolean = true) => {
  const valueToHash = useSalt ? `${HASH_SALT}${toHash}${HASH_SALT}` : toHash;
  return Aes.sha256(valueToHash);
};

export const encrypt = async (value: string, key: string = ''): Promise<EncryptedData> => {
  if (!key) return { cipher: value, iv: '' };

  const hashedKey = await hashFrom(key);
  const iv = await Aes.randomKey(16);
  const cipher = await Aes.encrypt(value, hashedKey, iv, ENCRYPTION_ALGORITHM);

  return { cipher, iv };
};

export const decrypt = async (value: string, iv: string = '', key: string = '') => {
  if (!key || !iv) return value;

  const hashedKey = await hashFrom(key);
  const decryptedValue = await Aes.decrypt(value, hashedKey, iv, ENCRYPTION_ALGORITHM);

  return decryptedValue;
};

export const deviceHasBiometrics = async () => {
  const biometricsType = await getSupportedBiometryType();

  return !!biometricsType;
};

const BIOMETRICS = 'biometrics';

const biometricsConfig: Options = {
  service: BIOMETRICS,
  storage: STORAGE_TYPE.RSA,
  accessControl: ACCESS_CONTROL.BIOMETRY_ANY,
  authenticationType: AUTHENTICATION_TYPE.BIOMETRICS,
  securityLevel: SECURITY_LEVEL.SECURE_HARDWARE,
};

export const toggleBiometrics = (enable?: boolean) => {
  if (enable) {
    return setGenericPassword(BIOMETRICS, BIOMETRICS, biometricsConfig);
  } else {
    return resetGenericPassword(biometricsConfig);
  }
};

export const obtainBiometrics = (title?: string | null, cancel?: string | null) => getGenericPassword({
  ...biometricsConfig,
  ...(title || cancel ? {
    authenticationPrompt: {
      title: title || undefined,
      cancel: cancel || undefined,
    },
  } : {}),
});

export const getStoredPassword = () => EncryptedStorage.getItem(StorageKeys.PASSWORD);

export const storePassword = async (password: string) => {
  const hashedPassword = await hashFrom(password);

  EncryptedStorage.setItem(StorageKeys.PASSWORD, hashedPassword);
};

export const comparePassword = async (password: string) => {
  const storedPassword = await getStoredPassword();

  const hashedPassword = await hashFrom(password);

  if (storedPassword === hashedPassword) return true;

  const oldVersionHashedPassword = await hashFrom(password, false);

  if (storedPassword === oldVersionHashedPassword) {
    // Update the stored password if it comes from old app versions
    await EncryptedStorage.setItem(StorageKeys.PASSWORD, hashedPassword);
    return true;
  }

  return false;
};
