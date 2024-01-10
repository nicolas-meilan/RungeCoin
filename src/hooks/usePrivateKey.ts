import EncryptedStorage from 'react-native-encrypted-storage';

import usePrivateKeyConfig from './usePrivateKeyConfig';
import StorageKeys from '@system/storageKeys';
import { EncryptedData, decrypt, encrypt } from '@utils/security';
import { erc20BlockchainsConfigurationPropagation } from '@utils/web3';
import { Blockchains } from '@web3/constants';

type UsePrivateKeyReturn = {
  getPrivateKey: (blockchain: Blockchains, encryptionKey?: string) => Promise<string | null>;
  setPrivateKey: (blockchain: Blockchains, newPrivateKey: string, encryptionKey?: string) => Promise<void>;
  encryptPrivateKeys: (encryptionKey: string) => Promise<void>;
  decryptPrivateKeys: (encryptionKey: string) => Promise<void>;
};

type PrivateKeysConfig = {
  [key in Blockchains]: StorageKeys;
};

const PRIVATE_KEYS_CONFIG: PrivateKeysConfig = {
  ...erc20BlockchainsConfigurationPropagation<StorageKeys>(StorageKeys.ERC20_WALLET_PRIVATE_KEY),
  [Blockchains.TRON]: StorageKeys.TRON_WALLET_PRIVATE_KEY,
};

const usePrivateKey = (): UsePrivateKeyReturn => {
  const { hasDoubleEncryption } = usePrivateKeyConfig();

  const getPrivateKey: UsePrivateKeyReturn['getPrivateKey'] = async (blockchain, encryptionKey) => {
    const privateKey = await EncryptedStorage.getItem(PRIVATE_KEYS_CONFIG[blockchain]);

    if (hasDoubleEncryption && privateKey) {
      const encryptedData: EncryptedData = JSON.parse(privateKey);
      const decryptedPrivateKey = decrypt(encryptedData.cipher, encryptedData.iv, encryptionKey);

      return decryptedPrivateKey;
    }

    return privateKey;
  };

  const setPrivateKey: UsePrivateKeyReturn['setPrivateKey'] = async (blockchain, newPrivateKey, encryptionKey) => {
    if (hasDoubleEncryption) {
      const encryptedData = encrypt(newPrivateKey, encryptionKey);
      EncryptedStorage.setItem(PRIVATE_KEYS_CONFIG[blockchain], JSON.stringify(encryptedData));
      return;
    }

    EncryptedStorage.setItem(PRIVATE_KEYS_CONFIG[blockchain], newPrivateKey);
  };

  const encryptPrivateKeys: UsePrivateKeyReturn['encryptPrivateKeys'] = async (encryptionKey) => {
    const blockchains = Object.values(Blockchains);

    const privateKeys = await Promise.all(
      blockchains.map((blockchain) => getPrivateKey(blockchain)),
    );

    const encryptedPrivateKeys = privateKeys.map((currentPrivateKey) => encrypt(currentPrivateKey || '', encryptionKey));

    await Promise.all(
      encryptedPrivateKeys.map((currentEncryptedData, index) => (
        EncryptedStorage.setItem(PRIVATE_KEYS_CONFIG[blockchains[index]], JSON.stringify(currentEncryptedData))
      )),
    );
  };

  const decryptPrivateKeys: UsePrivateKeyReturn['decryptPrivateKeys'] = async (encryptionKey) => {
    const blockchains = Object.values(Blockchains);

    const privateKeys = await Promise.all(
      blockchains.map(async (blockchain) => getPrivateKey(blockchain, encryptionKey)),
    );

    await Promise.all(
      privateKeys.map((currentPrivateKey, index) => (
        EncryptedStorage.setItem(PRIVATE_KEYS_CONFIG[blockchains[index]], currentPrivateKey || '')
      )),
    );
  };

  return {
    getPrivateKey,
    setPrivateKey,
    encryptPrivateKeys,
    decryptPrivateKeys,
  };
};

export default usePrivateKey;
