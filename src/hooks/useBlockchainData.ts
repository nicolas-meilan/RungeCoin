import { useMemo } from 'react';

import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Provider } from 'ethers';
import { zipObject } from 'lodash';

import StorageKeys from '@system/storageKeys';
import { ReactQueryKeys } from '@utils/constants';
import { Blockchains, DEFAULT_BLOCKCHAIN } from '@web3/constants';
import getProvider, { tronProvider } from '@web3/providers';
import getTokens, {
  BASE_TOKEN_ADDRESS,
  TokensStruct,
  TokenType,
} from '@web3/tokens';

type UseBlockchainDataProps = {
  refetchOnMount?: boolean;
};

type UseBlockchainDataReturn = {
  setBlockchain: (blockchain: Blockchains) => void;
  removeBlockchain: () => void;
  blockchainLoading: boolean;
  isBlockchainInitialLoading: boolean;
  blockchainsBaseToken: {
    [blockchain in Blockchains]: TokenType;
  };
  blockchain: Blockchains;
  blockchainProvider: Provider | typeof tronProvider;
  tokens: TokensStruct;
  blockchainBaseToken: TokenType;
};

const useBlockchainData = ({
  refetchOnMount,
}: UseBlockchainDataProps = {
  refetchOnMount: false,
}): UseBlockchainDataReturn => {
  const { getItem, setItem, removeItem } = useAsyncStorage(StorageKeys.BLOCKCHAIN);
  const queryClient = useQueryClient();

  const getBlockchainFromStorage = async () => {
    const storedWalletStr = await getItem();
    const storedWallet: Blockchains = storedWalletStr ? JSON.parse(storedWalletStr) : null;

    return storedWallet;
  };

  const {
    data: StoredBlockchain,
    isLoading,
    isRefetching,
    isInitialLoading: isBlockchainInitialLoading,
  } = useQuery({
    queryKey: [ReactQueryKeys.BLOCKCHAIN],
    queryFn: getBlockchainFromStorage,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const setBlockchainStorage = async (wallet: Blockchains) => {
    await setItem(JSON.stringify(wallet));

    return wallet;
  };

  const { mutate: mutateSetBlockchain } = useMutation({
    mutationKey: [ReactQueryKeys.BLOCKCHAIN],
    mutationFn: setBlockchainStorage,
  });

  const setBlockchain = (newBlockchain: Blockchains) => mutateSetBlockchain(newBlockchain, {
    onSuccess: (savedWalletPublicValues) => queryClient.setQueryData([ReactQueryKeys.BLOCKCHAIN], savedWalletPublicValues),
  });

  const { mutate: mutateRemoveBlockchain } = useMutation({
    mutationKey: [ReactQueryKeys.BLOCKCHAIN],
    mutationFn: removeItem,
  });

  const removeBlockchain = () => mutateRemoveBlockchain(undefined, {
    onSuccess: () => queryClient.setQueryData([ReactQueryKeys.BLOCKCHAIN], null),
  });

  const findBlockchainBaseToken = (tokens: TokensStruct) => Object.values(tokens)
    .find(({ address }) => address === BASE_TOKEN_ADDRESS)!;

  const blockchainsBaseToken = useMemo(() => {
    const blockchainsKeys = Object.keys(Blockchains) as Blockchains[];

    return {
      ...zipObject(
        blockchainsKeys,
        blockchainsKeys.map((blockchainKey) => (
          findBlockchainBaseToken(getTokens(blockchainKey))
        )),
      ),
    } as UseBlockchainDataReturn['blockchainsBaseToken'];
  }, []);

  const blockchain = useMemo(() => StoredBlockchain || DEFAULT_BLOCKCHAIN, [StoredBlockchain]);

  const blockchainProvider = useMemo(() => getProvider(blockchain), [blockchain]);

  const tokens = useMemo(() => getTokens(blockchain), [blockchain]);

  const blockchainBaseToken = useMemo(() => findBlockchainBaseToken(tokens), [tokens]);

  return {
    setBlockchain,
    removeBlockchain,
    blockchainLoading: isLoading || isRefetching,
    isBlockchainInitialLoading,
    blockchain,
    blockchainsBaseToken,
    blockchainProvider,
    tokens,
    blockchainBaseToken,
  };
};

export default useBlockchainData;
