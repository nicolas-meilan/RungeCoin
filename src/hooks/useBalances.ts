import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { BigNumber } from 'ethers';

import useBlockchainData from './useBlockchainData';
import useNotifications from './useNotifications';
import useWalletPublicValues from './useWalletPublicValues';
import { ReactQueryKeys } from '@utils/constants';
import { Blockchains } from '@web3/constants';
import type { TokensBalance, TokenSymbol } from '@web3/tokens';
import { getWalletBalance } from '@web3/wallet';

export type TokensBalanceArrayItem = {
  symbol: TokenSymbol;
  balance: BigNumber;
};

type UseBalancesReturn = {
  tokenBalances?: TokensBalance | null;
  tokenBalancesLoading: boolean;
  refetchBalances: () => Promise<void>;
  orderTokens: () => TokensBalanceArrayItem[] | null;
};

type QueryKey = [ReactQueryKeys, Blockchains];
type QueryOptions = UseQueryOptions<TokensBalance | null, unknown, TokensBalance | null, QueryKey>;
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

  const queryKey: QueryKey = [ReactQueryKeys.BALANCES, blockchain];

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

  const orderTokens: UseBalancesReturn['orderTokens'] = () => {
    if (!tokenBalances) return null;

    const { balances, zeroBalances } = Object.keys(tokenBalances).reduce((
      acc,
      symbol,
    ) => {
      const balance = tokenBalances[symbol as TokenSymbol];

      const item = {
        symbol,
        balance,
      };
      if (balance.isZero()) {
        acc.zeroBalances.push(item as TokensBalanceArrayItem);
      } else {
        acc.balances.push(item as TokensBalanceArrayItem);
      }

      return acc;
    }, {
      balances: [],
      zeroBalances: [],
    } as {
      balances: TokensBalanceArrayItem[];
      zeroBalances: TokensBalanceArrayItem[];
    });

    return [...balances, ...zeroBalances];
  };

  return {
    tokenBalances,
    tokenBalancesLoading: isLoading || isRefetching,
    refetchBalances,
    orderTokens,
  };
};

export default useBalances;
