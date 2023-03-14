import { useQuery, UseQueryOptions } from '@tanstack/react-query';
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
};

type QueryOptions = UseQueryOptions<TokenConversion | null, unknown, TokenConversion | null, ReactQueryKeys[]>;
type UseTokenConversionsProps = Omit<QueryOptions, 'queryKey' | 'queryFn' | 'initialData'>;

const useTokenConversions = (options: UseTokenConversionsProps = {}): UseTokenConversionssReturn => {
  const {
    data: tokenConversions,
    isLoading: tokenConversionsLoading,
  } = useQuery({
    queryKey: [ReactQueryKeys.TOKEN_CONVERSIONS],
    queryFn: getTokenConversions,
    initialData: null,
    ...options,
  });

  const convert: UseTokenConversionssReturn['convert'] = (balance, from) => {
    if (!tokenConversions) return 0;

    const balanceToConvert = BigNumber.isBigNumber(balance) ? balance : BigNumber.from(balance);
  
    // TODO select to
    const to = tokenConversions[from.symbol].USD;

    return bigNumberMulNumber(balanceToConvert, to, from.decimals);
  };

  return {
    tokenConversions,
    tokenConversionsLoading,
    convert,
  };
};

export default useTokenConversions;
