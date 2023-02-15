import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { UseMutateFunction, useMutation, useQueryClient } from '@tanstack/react-query';
import EncryptedStorage from 'react-native-encrypted-storage';

import StorageKeys from '@system/storageKeys';
import { ReactQueryKeys } from '@utils/constants';
import { toggleBiometrics } from '@utils/security';

type UseDestroyWalletReturn = () => Promise<void>;

const useDestroyWallet = (): UseDestroyWalletReturn => {
  const { removeItem: removeWalletPublicValues } = useAsyncStorage(StorageKeys.WALLET);
  const { removeItem: removePasswordAttemps } = useAsyncStorage(StorageKeys.PASSWORD_ATTEMPS);

  const removePrivateKey = () => EncryptedStorage.removeItem(StorageKeys.WALLET_PRIVATE_KEY);
  const removePassword = () => EncryptedStorage.removeItem(StorageKeys.PASSWORD);

  const QueryClient = useQueryClient();

  const { mutate: mutateRemoveWalletPublicValues } = useMutation({
    mutationKey: [ReactQueryKeys.WALLET_PUBLIC_VALUES_KEY],
    mutationFn: removeWalletPublicValues,
  });

  const { mutate: mutateBiometrics } = useMutation({
    mutationKey: [ReactQueryKeys.BIOMETRICS],
    mutationFn: async () => {
      toggleBiometrics(false);

      return false;
    },
  });

  const updateQuery = (
    mutation: UseMutateFunction<unknown, unknown, any, unknown>,
    key: ReactQueryKeys,
  ) => mutation(undefined, { onSuccess: (data: any) => QueryClient.setQueryData([key], data || null) });

  const destroyWallet = async () => {
    updateQuery(mutateBiometrics, ReactQueryKeys.BIOMETRICS);
    updateQuery(mutateRemoveWalletPublicValues, ReactQueryKeys.WALLET_PUBLIC_VALUES_KEY);

    await Promise.all([
      removePasswordAttemps,
      removePrivateKey,
      removePassword,
    ]);
  };

  return destroyWallet;
};

export default useDestroyWallet;
