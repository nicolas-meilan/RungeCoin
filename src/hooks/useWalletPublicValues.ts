import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import StorageKeys from '@system/storageKeys';
import { ReactQueryKeys } from '@utils/constants';
import {
  WalletPublicValues,
  getHwWalletAddress,
} from '@web3/wallet';

type UseWalletPublicValuesProps = {
  refetchOnMount?: boolean;
};

type UseWalletPublicValuesReturn = {
  walletPublicValues?: WalletPublicValues | null;
  setWalletPublicValues: (wallet: WalletPublicValues) => void;
  setWalletPublicValuesHw: (bluetoothConnection?: boolean) => void;
  removeWalletPublicValues: () => void;
  walletPublicValuesLoading: boolean;
};

const useWalletPublicValues = ({
  refetchOnMount,
}: UseWalletPublicValuesProps = {
  refetchOnMount: false,
}): UseWalletPublicValuesReturn => {
  const { getItem, setItem, removeItem } = useAsyncStorage(StorageKeys.WALLET);
  const queryClient = useQueryClient();

  const getWalletFromStorage = async () => {
    const storedWalletStr = await getItem();
    const storedWallet: WalletPublicValues = storedWalletStr ? JSON.parse(storedWalletStr) : null;

    return storedWallet;
  };

  const {
    data: walletPublicValues,
    isLoading: walletPublicValuesLoading,
  } = useQuery({
    queryKey: [ReactQueryKeys.WALLET_PUBLIC_VALUES_KEY],
    queryFn: getWalletFromStorage,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const setWallet = async (wallet: WalletPublicValues) => {
    await setItem(JSON.stringify(wallet));

    return wallet;
  };

  const { mutate: mutateSetWallet } = useMutation({
    mutationKey: [ReactQueryKeys.WALLET_PUBLIC_VALUES_KEY],
    mutationFn: setWallet,
  });

  const setWalletPublicValues = (newWalletPublicValues: WalletPublicValues) => mutateSetWallet(newWalletPublicValues, {
    onSuccess: (savedWalletPublicValues) => queryClient.setQueryData([ReactQueryKeys.WALLET_PUBLIC_VALUES_KEY], savedWalletPublicValues),
  });

  const setWalletPublicValuesHw = async (bluetoothConnection: boolean = false) => {
    console.log({ bluetoothConnection })
    const newWalletPublicValues = await getHwWalletAddress({ bluetoothConnection });
    return mutateSetWallet(newWalletPublicValues, {
      onSuccess: (savedWalletPublicValues) => queryClient.setQueryData([ReactQueryKeys.WALLET_PUBLIC_VALUES_KEY], savedWalletPublicValues),
    });
  };

  const { mutate: mutateRemoveWallet } = useMutation({
    mutationKey: [ReactQueryKeys.WALLET_PUBLIC_VALUES_KEY],
    mutationFn: removeItem,
  });

  const removeWalletPublicValues = () => mutateRemoveWallet(undefined, {
    onSuccess: () => queryClient.setQueryData([ReactQueryKeys.WALLET_PUBLIC_VALUES_KEY], null),
  });

  return {
    walletPublicValues,
    walletPublicValuesLoading,
    setWalletPublicValues,
    removeWalletPublicValues,
    setWalletPublicValuesHw,
  };
};

export default useWalletPublicValues;
