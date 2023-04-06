import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';

import useBlockchainData from './useBlockchainData';
import useNotifications from './useNotifications';
import useWalletPublicValues from './useWalletPublicValues';
import { ReactQueryKeys } from '@utils/constants';
import { Blockchains } from '@web3/constants';
import { TokensBalance } from '@web3/tokens';
import { getWalletBalance } from '@web3/wallet';

type UseBalancesReturn = {
  tokenBalances?: TokensBalance | null;
  tokenBalancesLoading: boolean;
  refetchBalances: () => Promise<void>;
};

type QueryClient = [ReactQueryKeys, Blockchains];
type QueryOptions = UseQueryOptions<TokensBalance | null, unknown, TokensBalance | null, QueryClient>;
type UseBalancesProps = Omit<QueryOptions, 'queryKey' | 'queryFn' | 'initialData'>;

const useBalances = (options: UseBalancesProps = {}): UseBalancesReturn => {
  const queryClient = useQueryClient();

  const { dispatchNotification } = useNotifications();

  const { walletPublicValues } = useWalletPublicValues();
  const { blockchain } = useBlockchainData();

  const fetchBalances = async () => {
    if (!walletPublicValues) return null;

    return getWalletBalance(blockchain, walletPublicValues.address);
  };

  const queryKey: QueryClient = [ReactQueryKeys.BALANCES, blockchain];

  const onError = () => dispatchNotification('error.balances', 'error');

  const {
    data: tokenBalances,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: fetchBalances,
    initialData: null,
    onError,
    ...(options || {}),
  });

  const refetchBalances = async () => {
    await refetch().then(({ data }) => queryClient.setQueryData(queryKey, data));
  };

  return {
    tokenBalances,
    tokenBalancesLoading: isLoading || isRefetching,
    refetchBalances,
  };
};

export default useBalances;
