import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import StorageKeys from '@system/storageKeys';
import { ReactQueryKeys } from '@utils/constants';
import { getHwWalletAddress } from '@web3/wallet';

type UseWalletPublicValuesProps = {
  refetchOnMount?: boolean;
  onSetWalletPublicValuesHwError?: () => void;
};

export type StoredWallet = {
  address: string;
  isHw: boolean;
  hwConnectedByBluetooth: boolean;
};

type UseWalletPublicValuesReturn = {
  walletPublicValues?: StoredWallet | null;
  setWalletPublicValues: (address: string) => void;
  setWalletPublicValuesHw: (bluetoothConnection?: boolean) => void;
  setHwConnection: (hwConnectedByBluetooth: boolean) => void;
  removeWalletPublicValues: () => void;
  walletPublicValuesLoading: boolean;
};

const useWalletPublicValues = ({
  refetchOnMount,
  onSetWalletPublicValuesHwError,
}: UseWalletPublicValuesProps = {
  refetchOnMount: false,
}): UseWalletPublicValuesReturn => {
  const { getItem, setItem, removeItem } = useAsyncStorage(StorageKeys.WALLET);
  const queryClient = useQueryClient();

  const getWalletFromStorage = async () => {
    const storedWalletStr = await getItem();
    const storedWallet: StoredWallet = storedWalletStr ? JSON.parse(storedWalletStr) : null;

    return storedWallet;
  };

  const {
    data: walletPublicValues,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: [ReactQueryKeys.WALLET_PUBLIC_VALUES_KEY],
    queryFn: getWalletFromStorage,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const setWallet = async (wallet: StoredWallet) => {
    await setItem(JSON.stringify(wallet));

    return wallet;
  };

  const { mutate: mutateSetWallet } = useMutation({
    mutationKey: [ReactQueryKeys.WALLET_PUBLIC_VALUES_KEY],
    mutationFn: setWallet,
  });

  const setWalletPublicValues = (address: string) => mutateSetWallet({
    address,
    isHw: false,
    hwConnectedByBluetooth: false,
  }, {
    onSuccess: (savedWalletPublicValues) => queryClient.setQueryData([ReactQueryKeys.WALLET_PUBLIC_VALUES_KEY], savedWalletPublicValues),
  });

  const setWalletPublicValuesHw = async (bluetoothConnection: boolean = false) => {
    try {
      const address = await getHwWalletAddress({ bluetoothConnection });
      const walletToStore: StoredWallet = {
        address,
        isHw: true,
        hwConnectedByBluetooth: bluetoothConnection,
      };

      return mutateSetWallet(walletToStore, {
        onSuccess: (savedWallet) => queryClient.setQueryData([ReactQueryKeys.WALLET_PUBLIC_VALUES_KEY], savedWallet),
      });
    } catch (error) {
      onSetWalletPublicValuesHwError?.();
    }
  };

  const setHwConnection = async (hwConnectedByBluetooth: boolean) => {
    const voidWalletPublicValuesHw: StoredWallet = {
      address: '',
      isHw: true,
      hwConnectedByBluetooth,
    };

    const walletToStore: StoredWallet = {
      ...(walletPublicValues || voidWalletPublicValuesHw),
      hwConnectedByBluetooth,
    };

    return mutateSetWallet(walletToStore, {
      onSuccess: (savedWallet) => queryClient.setQueryData([ReactQueryKeys.WALLET_PUBLIC_VALUES_KEY], savedWallet),
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
    walletPublicValuesLoading: isLoading || isRefetching,
    setWalletPublicValues,
    removeWalletPublicValues,
    setWalletPublicValuesHw,
    setHwConnection,
  };
};

export default useWalletPublicValues;
