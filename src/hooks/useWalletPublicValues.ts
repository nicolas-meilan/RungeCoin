import { useMemo } from 'react';

import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import useBlockchainData from './useBlockchainData';
import StorageKeys from '@system/storageKeys';
import { ReactQueryKeys } from '@utils/constants';
import { erc20BlockchainsConfigurationPropagation } from '@utils/web3';
import { Blockchains } from '@web3/constants';
import { getHwWalletAddress } from '@web3/wallet';
import { setTronAddress } from '@web3/wallet/wallet.tron';


type UseWalletPublicValuesProps = {
  refetchOnMount?: boolean;
  onSetWalletPublicValuesHwError?: () => void;
};

export type Wallet = {
  erc20Address?: string;
  tronAddress?: string;
  isHw: boolean;
  hwConnectedByBluetooth: boolean;
};

type StoredWallet = {
  address?: string;
  erc20Address?: string;
  tronAddress?: string;
  isHw: boolean;
  hwConnectedByBluetooth: boolean;
};

type UseWalletPublicValuesReturn = {
  walletPublicValues?: Wallet | null;
  address?: string;
  setWalletPublicValues: ({
    erc20Address,
    tronAddress,
  }: {
    erc20Address: string;
    tronAddress: string;
  }) => void;
  setWalletPublicValuesHw: (
    blockchain: Blockchains,
    bluetoothConnection?: boolean,
  ) => void;
  setHwConnection: (hwConnectedByBluetooth: boolean) => void;
  removeWalletPublicValues: () => void;
  walletPublicValuesLoading: boolean;
};

type AddressProp = 'erc20Address' | 'tronAddress';
const BLOCKCHAIN_ADDRESS_CONFIG: {
  [blockchain in Blockchains]: AddressProp;
} = {
  ...erc20BlockchainsConfigurationPropagation<AddressProp>('erc20Address'),
  [Blockchains.TRON]: 'tronAddress',
};

const useWalletPublicValues = ({
  refetchOnMount,
  onSetWalletPublicValuesHwError,
}: UseWalletPublicValuesProps = {
  refetchOnMount: false,
}): UseWalletPublicValuesReturn => {
  const { getItem, setItem, removeItem } = useAsyncStorage(StorageKeys.WALLET);
  const queryClient = useQueryClient();
  const { blockchain } = useBlockchainData();

  const getWalletFromStorage = async () => {
    const storedWalletStr = await getItem();
    const storedWallet: StoredWallet | null = storedWalletStr ? JSON.parse(storedWalletStr) : null;
    setTronAddress(storedWallet?.tronAddress);

    if (!storedWallet) return storedWallet;

    // parse old storage wallet to the new
    const wallet: Wallet = {
      erc20Address: storedWallet.erc20Address || storedWallet.address!,
      tronAddress: storedWallet.tronAddress,
      isHw: storedWallet.isHw,
      hwConnectedByBluetooth: storedWallet.hwConnectedByBluetooth,
    };

    return wallet;
  };

  const {
    data: walletPublicValues,
    isLoading,
  } = useQuery({
    queryKey: [ReactQueryKeys.WALLET_PUBLIC_VALUES_KEY],
    queryFn: getWalletFromStorage,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const setWallet = async (wallet: Wallet) => {
    await setItem(JSON.stringify(wallet));

    return wallet;
  };

  const { mutate: mutateSetWallet, isLoading: mutationLoading } = useMutation({
    mutationKey: [ReactQueryKeys.WALLET_PUBLIC_VALUES_KEY],
    mutationFn: setWallet,
  });

  const setWalletPublicValues: UseWalletPublicValuesReturn['setWalletPublicValues'] = ({
    erc20Address,
    tronAddress,
  }) => mutateSetWallet({
    erc20Address,
    tronAddress,
    isHw: false,
    hwConnectedByBluetooth: false,
  }, {
    onSuccess: (savedWalletPublicValues) => {
      setTronAddress(tronAddress);
      queryClient.setQueryData([ReactQueryKeys.WALLET_PUBLIC_VALUES_KEY], savedWalletPublicValues);
    },
  });

  const setWalletPublicValuesHw: UseWalletPublicValuesReturn['setWalletPublicValuesHw']
    = async (blockchainToConnect, bluetoothConnection = false) => {
      try {
        const address = await getHwWalletAddress(blockchainToConnect, { bluetoothConnection });
        const walletToStore: Wallet = {
          [BLOCKCHAIN_ADDRESS_CONFIG[blockchainToConnect]]: address,
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
    const voidWalletPublicValuesHw: Wallet = {
      erc20Address: '',
      tronAddress: '',
      isHw: true,
      hwConnectedByBluetooth,
    };

    const walletToStore: Wallet = {
      ...(walletPublicValues || voidWalletPublicValuesHw),
      hwConnectedByBluetooth,
    };

    return mutateSetWallet(walletToStore, {
      onSuccess: (savedWallet) => queryClient.setQueryData([ReactQueryKeys.WALLET_PUBLIC_VALUES_KEY], savedWallet),
    });
  };

  const { mutate: mutateRemoveWallet, isLoading: removingMutationLoading } = useMutation({
    mutationKey: [ReactQueryKeys.WALLET_PUBLIC_VALUES_KEY],
    mutationFn: removeItem,
  });

  const removeWalletPublicValues = () => mutateRemoveWallet(undefined, {
    onSuccess: () => queryClient.setQueryData([ReactQueryKeys.WALLET_PUBLIC_VALUES_KEY], null),
  });

  const address = useMemo(() => (
    walletPublicValues?.[BLOCKCHAIN_ADDRESS_CONFIG[blockchain]]
  ), [
    blockchain,
    walletPublicValues?.erc20Address,
    walletPublicValues?.tronAddress,
  ]);

  return {
    address,
    walletPublicValues,
    walletPublicValuesLoading: isLoading || mutationLoading || removingMutationLoading,
    setWalletPublicValues,
    removeWalletPublicValues,
    setWalletPublicValuesHw,
    setHwConnection,
  };
};

export default useWalletPublicValues;
