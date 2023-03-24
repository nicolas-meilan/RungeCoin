import { useMemo } from 'react';

import { useInfiniteQuery, UseInfiniteQueryOptions, useQueryClient } from '@tanstack/react-query';

import useWalletPublicValues from './useWalletPublicValues';
import { WalletTx, getWalletTxs } from '@http/tx';
import { ReactQueryKeys } from '@utils/constants';


type UseWalletActivityReturn = {
  tokenActivity: WalletTx[];
  tokenActivityLoading: boolean;
  refetchTokenActivity: () => Promise<void>;
  next: () => Promise<void>;
};

type QueryOptions = UseInfiniteQueryOptions<WalletTx[], unknown, WalletTx[], WalletTx[], [ReactQueryKeys, string]>;

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

  const { walletPublicValues } = useWalletPublicValues();

  const fetchTokenActivity = async (page: number) => {
    if (!walletPublicValues || !tokenAddress) return [];

    return getWalletTxs(walletPublicValues.address, tokenAddress, { page, offset: PAGE_OFFSET });
  };

  const queryKey: [ReactQueryKeys, string] = [ReactQueryKeys.TOKEN_ACTIVITY, tokenAddress];

  const {
    data,
    isLoading,
    isFetchingNextPage,
    isRefetching,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery<WalletTx[], unknown, WalletTx[], [ReactQueryKeys, string]>({
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    queryKey,
    queryFn: ({ pageParam = 1 }) => fetchTokenActivity(pageParam),
    getNextPageParam: (lastPage, allPages) => {
      if ((lastPage?.length || 0) < PAGE_OFFSET) return undefined;

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
