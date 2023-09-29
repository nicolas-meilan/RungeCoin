import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import EncryptedStorage from 'react-native-encrypted-storage';

import StorageKeys from '@system/storageKeys';
import { ReactQueryKeys } from '@utils/constants';
import { toggleBiometrics } from '@utils/security';

type UseDestroyWalletReturn = () => Promise<void>;

const useDestroyWallet = (): UseDestroyWalletReturn => {
  const { removeItem: removeWalletPublicValues } = useAsyncStorage(StorageKeys.WALLET);
  const { removeItem: removeBiometricsEnable } = useAsyncStorage(StorageKeys.BIOMETRICS);
  const { removeItem: removePrivateKeyConfig } = useAsyncStorage(StorageKeys.PRIVATE_KEY_CONFIG);
  const { removeItem: removeDoubleEncryptionFlag } = useAsyncStorage(StorageKeys.DOUBLE_ENCRYPTION_PRIVATE_KEY_FLAG);

  const removePasswordAttemps = () => EncryptedStorage.removeItem(StorageKeys.PASSWORD_ATTEMPS);
  const removeErc20PrivateKey = () => EncryptedStorage.removeItem(StorageKeys.ERC20_WALLET_PRIVATE_KEY);
  const removeTronPrivateKey = () => EncryptedStorage.removeItem(StorageKeys.TRON_WALLET_PRIVATE_KEY);
  const removePassword = () => EncryptedStorage.removeItem(StorageKeys.PASSWORD);
  const removePinFlagValue = () => EncryptedStorage.removeItem(StorageKeys.PIN_FLAG_VALUE);
  const removePinAttemps = () => EncryptedStorage.removeItem(StorageKeys.PIN_ATTEMPS);
  const removeBiometrics = async () => {
    await toggleBiometrics(false);
    await removeBiometricsEnable();
  };

  const QueryClient = useQueryClient();

  const destroyWallet = async () => {
    await Promise.all([
      removeWalletPublicValues(),
      removePrivateKeyConfig(),
      removePasswordAttemps(),
      removeErc20PrivateKey(),
      removeTronPrivateKey(),
      removePassword(),
      removeBiometrics(),
      removePinFlagValue(),
      removePinAttemps(),
      removeDoubleEncryptionFlag(),
    ]);
    QueryClient.setQueryData([ReactQueryKeys.BIOMETRICS], false);
    QueryClient.setQueryData([ReactQueryKeys.WALLET_PUBLIC_VALUES_KEY], null);
    QueryClient.setQueryData([ReactQueryKeys.PRIVATE_KEY_CONFIG], null);
  };

  return destroyWallet;
};

export default useDestroyWallet;
