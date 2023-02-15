import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import EncryptedStorage from 'react-native-encrypted-storage';

import StorageKeys from '@system/storageKeys';
import { ReactQueryKeys } from '@utils/constants';
import { toggleBiometrics } from '@utils/security';

type UseDestroyWalletReturn = () => Promise<void>;

const useDestroyWallet = (): UseDestroyWalletReturn => {
  const { removeItem: removeWalletPublicValues } = useAsyncStorage(StorageKeys.WALLET);
  const { removeItem: removePasswordAttemps } = useAsyncStorage(StorageKeys.PASSWORD_ATTEMPS);
  const { removeItem: removeBiometricsEnable } = useAsyncStorage(StorageKeys.BIOMETRICS);

  const removePrivateKey = () => EncryptedStorage.removeItem(StorageKeys.WALLET_PRIVATE_KEY);
  const removePassword = () => EncryptedStorage.removeItem(StorageKeys.PASSWORD);
  const removeBiometrics = async () => {
    await toggleBiometrics(false);
    await removeBiometricsEnable();
  };

  const QueryClient = useQueryClient();

  const destroyWallet = async () => {
    await Promise.all([
      removeWalletPublicValues(),
      removePasswordAttemps(),
      removePrivateKey(),
      removePassword(),
      removeBiometrics(),
    ]);
    QueryClient.setQueryData([ReactQueryKeys.BIOMETRICS], false);
    QueryClient.setQueryData([ReactQueryKeys.WALLET_PUBLIC_VALUES_KEY], null);
  };

  return destroyWallet;
};

export default useDestroyWallet;
