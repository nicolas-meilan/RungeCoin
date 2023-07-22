import EncryptedStorage from 'react-native-encrypted-storage';

import StorageKeys from '@system/storageKeys';
import { erc20BlockchainsConfigurationPropagation } from '@utils/web3';
import { Blockchains } from '@web3/constants';

type UsePrivateKeyReturn = {
  getPrivateKey: (blockchain: Blockchains) => Promise<string | null>;
  setPrivateKey: (blockchain: Blockchains, newPrivateKey: string) => Promise<void>;
};

type PrivateKeysConfig = {
  [key in Blockchains]: StorageKeys;
};

const PRIVATE_KEYS_CONFIG: PrivateKeysConfig = {
  ...erc20BlockchainsConfigurationPropagation<StorageKeys>(StorageKeys.ERC20_WALLET_PRIVATE_KEY),
  [Blockchains.TRON]: StorageKeys.TRON_WALLET_PRIVATE_KEY,
};

const usePrivateKey = (): UsePrivateKeyReturn => {
  const getPrivateKey: UsePrivateKeyReturn['getPrivateKey'] = (blockchain) => (
    EncryptedStorage.getItem(PRIVATE_KEYS_CONFIG[blockchain])
  );

  const setPrivateKey: UsePrivateKeyReturn['setPrivateKey'] = (blockchain, newPrivateKey) => (
    EncryptedStorage.setItem(PRIVATE_KEYS_CONFIG[blockchain], newPrivateKey)
  );

  return {
    getPrivateKey,
    setPrivateKey,
  };
};

export default usePrivateKey;
