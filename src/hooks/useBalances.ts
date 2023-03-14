import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';

import useWalletPublicValues from './useWalletPublicValues';
import { ReactQueryKeys } from '@utils/constants';
import { TokensBalance } from '@web3/tokens';
import { getBalanceFromWallet } from '@web3/wallet';

type UseBalancesReturn = {
  tokenBalances?: TokensBalance | null;
  tokenBalancesLoading: boolean;
  refetchBalances: () => Promise<void>;
};

type QueryOptions = UseQueryOptions<TokensBalance | null, unknown, TokensBalance | null, ReactQueryKeys[]>;
type UseBalanceProps = Omit<QueryOptions, 'queryKey' | 'queryFn' | 'initialData'>;

const useBalances = (options: UseBalanceProps = {}): UseBalancesReturn => {
  const queryClient = useQueryClient();

  const { walletPublicValues } = useWalletPublicValues();

  const fetchBalances = async () => {
    if (!walletPublicValues) return null;

    return getBalanceFromWallet(walletPublicValues.address);
  };

  const {
    data: tokenBalances,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: [ReactQueryKeys.BALANCES],
    queryFn: fetchBalances,
    initialData: null,
    ...(options || {}),
  });

  const refetchBalances = async () => {
    await refetch().then(({ data }) => queryClient.setQueryData([ReactQueryKeys.BALANCES], data));
  };

  return {
    tokenBalances,
    tokenBalancesLoading: isLoading || isRefetching,
    refetchBalances,
  };
};

export default useBalances;
