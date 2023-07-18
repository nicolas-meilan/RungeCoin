import { useMemo, useState } from 'react';

import { useInfiniteQuery, UseInfiniteQueryOptions, useQueryClient } from '@tanstack/react-query';

import useBlockchainData from './useBlockchainData';
import useNotifications from './useNotifications';
import useWalletPublicValues from './useWalletPublicValues';
import { getWalletTxs } from '@http/tx';
import { WalletTx } from '@http/tx/types';
import { ReactQueryKeys } from '@utils/constants';
import { Blockchains } from '@web3/constants';


type UseWalletActivityReturn = {
  tokenActivity: WalletTx[];
  tokenActivityLoading: boolean;
  refetchTokenActivity: () => Promise<void>;
  next: () => Promise<void>;
};

type QueryKey = [ReactQueryKeys, string, Blockchains];
type QueryOptions = UseInfiniteQueryOptions<WalletTx[], unknown, WalletTx[], WalletTx[], QueryKey>;

type UseWalletActivityProps = {
  tokenAddress: string;
  options?: Omit<QueryOptions, 'queryKey' | 'queryFn' | 'getNextPageParam'>;
};

const PAGE_OFFSET = 10;
const useWalletActivity = ({
  tokenAddress,
  options = {},
}: UseWalletActivityProps): UseWalletActivityReturn => {
  const queryClient = useQueryClient();

  const [fetchError, setFetchError] = useState(false);

  const { dispatchNotification } = useNotifications();

  const { blockchain } = useBlockchainData();
  const { address } = useWalletPublicValues();

  const fetchTokenActivity = async (page: number) => {
    if (!address || !tokenAddress) return [];

    const walletTxs = await getWalletTxs(address, tokenAddress, blockchain, {
      page,
      offset: PAGE_OFFSET,
    });

    setFetchError(false);
    return walletTxs;
  };

  const queryKey: QueryKey = [
    ReactQueryKeys.TOKEN_ACTIVITY,
    tokenAddress,
    blockchain,
  ];

  const onError = () => {
    dispatchNotification('error.walletActivity', 'error');
    setFetchError(true);
  };

  const {
    data,
    isLoading,
    isFetchingNextPage,
    isRefetching,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery<WalletTx[], unknown, WalletTx[], QueryKey>({
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry:false,
    queryKey,
    onError,
    queryFn: ({ pageParam }) => fetchTokenActivity(pageParam || 1),
    getNextPageParam: (lastPage, allPages) => {
      const lastPageLength = lastPage?.length || 0;
      if (lastPageLength < PAGE_OFFSET) return undefined;

      return (allPages?.length || 0) + 1;
    },
    ...options,
  });

  const refetchTokenActivity = async () => {
    const result = await refetch({ refetchPage: (_, index) => index === 0 });
    queryClient.setQueryData(queryKey, {
      ...result.data,
      pages: [result.data?.pages[0]],
    });
  };

  const next = async () => {
    if (fetchError) return;
    await fetchNextPage();
  };

  const tokenActivity = useMemo(() => {
    if (!data?.pages) return [];

    return data.pages.flat(1);
  }, [data]);

  return {
    tokenActivity,
    tokenActivityLoading: isFetchingNextPage || isLoading || isRefetching,
    refetchTokenActivity,
    next,
  };
};

export default useWalletActivity;
