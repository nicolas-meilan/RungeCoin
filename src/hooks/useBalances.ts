import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import useWalletPublicValues from './useWalletPublicValues';
import { ReactQueryKeys } from '@utils/constants';
import { TokensBalance } from '@web3/tokens';
import { getBalanceFromWallet } from '@web3/wallet';

type UseBalancesReturn = {
  tokenBalances?: TokensBalance | null;
  tokenBalancesLoading: boolean;
};

type QueryOptions = UseQueryOptions<TokensBalance | null, unknown, TokensBalance | null, ReactQueryKeys[]>;
type UseBalanceProps = {
  options?: (
    Omit<QueryOptions, 'queryKey' | 'queryFn' | 'initialData'>
  );
};

const useBalances = ({ options }: UseBalanceProps = {}): UseBalancesReturn => {
  const { walletPublicValues } = useWalletPublicValues();

  const fetchBalances = async () => {
    if (!walletPublicValues) return null;

    return getBalanceFromWallet(walletPublicValues.address);
  };

  const {
    data: tokenBalances,
    isLoading: tokenBalancesLoading,
  } = useQuery({
    queryKey: [ReactQueryKeys.BALANCES],
    queryFn: fetchBalances,
    initialData: null,
    ...(options || {}),
  });

  return {
    tokenBalances,
    tokenBalancesLoading,
  };
};

export default useBalances;
