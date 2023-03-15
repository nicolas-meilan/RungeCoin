import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { BigNumber } from 'ethers';

import { getTokenConversions, TokenConversionsEndpointResponse } from '@http/tokens';
import { ReactQueryKeys } from '@utils/constants';
import { bigNumberMulNumber } from '@utils/number';
import type { TokenType } from '@web3/tokens';

type TokenConversion = TokenConversionsEndpointResponse['data'];

type UseTokenConversionssReturn = {
  tokenConversions?: TokenConversion | null;
  tokenConversionsLoading: boolean;
  convert: (balance: number | BigNumber, from: Omit<TokenType, 'name' | 'address' | 'svg'>) => number;
  refetchTokenConversions: () => Promise<void>;
};

type QueryOptions = UseQueryOptions<TokenConversion | null, unknown, TokenConversion | null, ReactQueryKeys[]>;
type UseTokenConversionsProps = Omit<QueryOptions, 'queryKey' | 'queryFn' | 'initialData'>;

const useTokenConversions = (options: UseTokenConversionsProps = {}): UseTokenConversionssReturn => {
  const queryClient = useQueryClient();

  const {
    data: tokenConversions,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: [ReactQueryKeys.TOKEN_CONVERSIONS],
    queryFn: getTokenConversions,
    initialData: null,
    ...options,
  });

  const refetchTokenConversions = async () => {
    await refetch().then(({ data }) => queryClient.setQueryData([ReactQueryKeys.TOKEN_CONVERSIONS], data));
  };

  const convert: UseTokenConversionssReturn['convert'] = (balance, from) => {
    if (!tokenConversions) return 0;

    const balanceToConvert = BigNumber.isBigNumber(balance) ? balance : BigNumber.from(balance);
  
    // TODO select to
    const to = tokenConversions[from.symbol].USD;

    return bigNumberMulNumber(balanceToConvert, to, from.decimals);
  };

  return {
    tokenConversions,
    tokenConversionsLoading: isLoading || isRefetching,
    convert,
    refetchTokenConversions,
  };
};

export default useTokenConversions;
