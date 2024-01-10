import { Buffer } from 'buffer';
import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto';

import { HASH_SALT } from '@env';
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

export const hashFrom = (toHash: string, algorithm = 'sha256') => {
  const valueToHash = `${HASH_SALT}${toHash}${HASH_SALT}`;

  return createHash(algorithm).update(valueToHash).digest();
};

export const encrypt = (value: string, key: string = ''): EncryptedData => {
  if (!key) return { cipher: value, iv: '' };

  const hashedKey = hashFrom(key);
  const iv = Buffer.from(randomBytes(16));
  const encryptor = createCipheriv(ENCRYPTION_ALGORITHM, hashedKey, iv);

  encryptor.write(value);
  encryptor.end();

  const cipher = encryptor.read().toString('base64');
  return { cipher, iv: iv.toString('base64') };
};

export const decrypt = (value: string, iv: string = '', key: string = '') => {
  if (!key || !iv) return value;

  const hashedKey = hashFrom(key);
  const decrypter = createDecipheriv(ENCRYPTION_ALGORITHM, hashedKey, Buffer.from(iv, 'base64'));

  decrypter.write(Buffer.from(value, 'base64'));
  decrypter.end();

  return decrypter.read().toString('utf8');
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
  const hashedPassword = hashFrom(password, 'sha512').toString('base64');

  await EncryptedStorage.setItem(StorageKeys.PASSWORD, hashedPassword);
};

export const comparePassword = async (password: string) => {
  const storedPassword = await getStoredPassword();

  const hashedPassword = hashFrom(password, 'sha512').toString('base64');

  return storedPassword === hashedPassword;
};
