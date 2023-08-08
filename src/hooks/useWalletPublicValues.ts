import { useMemo, useState } from 'react';

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
  onSetWalletPublicValuesHwError?: (error: string) => void;
  onSetWalletPublicValuesHwSuccess?: () => void;
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
  allowWalletAccess: boolean;
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
type BlockchainPublicValuesConfig = {
  addressProp: AddressProp;
  addressProcessor?: (newAddress?: string) => void;
};
export const BLOCKCHAIN_PUBLIC_VALUES_CONFIG: {
  [blockchain in Blockchains]: BlockchainPublicValuesConfig;
} = {
  ...erc20BlockchainsConfigurationPropagation<BlockchainPublicValuesConfig>({
    addressProp: 'erc20Address',
  }),
  [Blockchains.TRON]: {
    addressProp: 'tronAddress',
    addressProcessor: (newAddress) => {
      if (newAddress) setTronAddress(newAddress);
    },
  },
};

const useWalletPublicValues = ({
  refetchOnMount,
  onSetWalletPublicValuesHwError,
  onSetWalletPublicValuesHwSuccess,
}: UseWalletPublicValuesProps = {
  refetchOnMount: false,
}): UseWalletPublicValuesReturn => {
  const [hwLoading, setHwLoading] = useState(false);
  const { getItem, setItem, removeItem } = useAsyncStorage(StorageKeys.WALLET);
  const queryClient = useQueryClient();
  const { blockchain } = useBlockchainData();

  const runAllAddressProcessors = (newAddress?: string) => {
    Object.values(BLOCKCHAIN_PUBLIC_VALUES_CONFIG)
      .forEach((config) => config.addressProcessor?.(newAddress));
  };

  const getWalletFromStorage = async () => {
    const storedWalletStr = await getItem();
    const storedWallet: StoredWallet | null = storedWalletStr ? JSON.parse(storedWalletStr) : null;
    runAllAddressProcessors(storedWallet?.tronAddress);

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
        setHwLoading(true);
        const address = await getHwWalletAddress(blockchainToConnect, { bluetoothConnection });

        const blockchainConfig = BLOCKCHAIN_PUBLIC_VALUES_CONFIG[blockchainToConnect];
        const walletToStore: Wallet = {
          ...(walletPublicValues || {}),
          [blockchainConfig.addressProp]: address,
          isHw: true,
          hwConnectedByBluetooth: bluetoothConnection,
        };

        blockchainConfig.addressProcessor?.(address);
        setHwLoading(false);
        return mutateSetWallet(walletToStore, {
          onSuccess: (savedWallet) => {
            queryClient.setQueryData([ReactQueryKeys.WALLET_PUBLIC_VALUES_KEY], savedWallet);
            onSetWalletPublicValuesHwSuccess?.();
          },
        });
      } catch (error) {
        setHwLoading(false);
        onSetWalletPublicValuesHwError?.((error as { message: string })?.message);
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
    walletPublicValues?.[BLOCKCHAIN_PUBLIC_VALUES_CONFIG[blockchain].addressProp]
  ), [
    blockchain,
    walletPublicValues?.erc20Address,
    walletPublicValues?.tronAddress,
  ]);

  const allowWalletAccess = useMemo(() => !!(
    walletPublicValues?.erc20Address || walletPublicValues?.tronAddress
  ), [
    walletPublicValues?.erc20Address,
    walletPublicValues?.tronAddress,
  ]);

  return {
    address,
    allowWalletAccess,
    walletPublicValues,
    setWalletPublicValues,
    removeWalletPublicValues,
    setWalletPublicValuesHw,
    setHwConnection,
    walletPublicValuesLoading: isLoading
    || mutationLoading
    || removingMutationLoading
    || hwLoading,
  };
};

export default useWalletPublicValues;
