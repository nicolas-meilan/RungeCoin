import EncryptedStorage from 'react-native-encrypted-storage';

import { EncryptedData, decrypt, encrypt, getStoredPassword } from './security';
import StorageKeys from '@system/storageKeys';

export const storagePinFlagValue = async (pin: string) => {
  const storedPassword = await getStoredPassword();
  const encryptedStoredPassword = await encrypt(storedPassword || '', pin);
  await EncryptedStorage.setItem(StorageKeys.PIN_FLAG_VALUE, JSON.stringify(encryptedStoredPassword));
};

export const checkPin = async (pin: string) => {
  const [
    storedPinValue,
    currentHash,
  ] = await Promise.all([
    EncryptedStorage.getItem(StorageKeys.PIN_FLAG_VALUE),
    getStoredPassword(),
  ]);

  if (!storedPinValue) return false;

  const encryptedHash: EncryptedData = JSON.parse(storedPinValue);

  try {
    const decryptedHash = await decrypt(encryptedHash.cipher, encryptedHash.iv, pin);

    return currentHash === decryptedHash;
  } catch (error) {
    return false;
  }
};
