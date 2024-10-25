import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { parseUnits } from 'ethers';

import useConsolidatedCurrency from './useConsolidatedCurrency';
import useNotifications from './useNotifications';
import { getTokenConversions, TokenConversionsEndpointResponse } from '@http/tokens';
import { ReactQueryKeys } from '@utils/constants';
import { numberToFormattedString } from '@utils/formatter';
import { isZero, toBigInt } from '@utils/number';
import type { TokenType } from '@web3/tokens';

type TokenConversion = TokenConversionsEndpointResponse['data'];

type UseTokenConversionssReturn = {
  tokenConversions?: TokenConversion | null;
  tokenConversionsLoading: boolean;
  convert: (balance: number | bigint, from: Omit<TokenType, 'name' | 'address' | 'iconName'>) => number;
  refetchTokenConversions: () => Promise<void>;
};

type QueryOptions = UseQueryOptions<TokenConversion | null, unknown, TokenConversion | null, ReactQueryKeys[]>;
type UseTokenConversionsProps = Omit<QueryOptions, 'queryKey' | 'queryFn' | 'initialData'>;

const useTokenConversions = (options: UseTokenConversionsProps = {}): UseTokenConversionssReturn => {
  const queryClient = useQueryClient();

  const { dispatchNotification } = useNotifications();
  const { consolidatedCurrency } = useConsolidatedCurrency();

  const onError = () => dispatchNotification('error.tokenConversions', 'error');

  const {
    data: tokenConversions,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: [ReactQueryKeys.TOKEN_CONVERSIONS],
    queryFn: getTokenConversions,
    initialData: null,
    onError,
    ...options,
  });

  const refetchTokenConversions = async () => {
    await refetch().then(({ data }) => queryClient.setQueryData([ReactQueryKeys.TOKEN_CONVERSIONS], data));
  };

  const convert: UseTokenConversionssReturn['convert'] = (balance, from) => {
    const balanceToConvert = toBigInt(balance);

    if (!tokenConversions || isZero(balanceToConvert)) return 0;

    const to = tokenConversions[from .symbol]?.[consolidatedCurrency!] || 0;
    const toDecimals = to.toString().split('.')?.[1]?.length || 0;

    const convertedBalance = balanceToConvert
      * (parseUnits(to.toString(), toDecimals)) // add extra decimals for multiplication
      / (BigInt(`1${new Array(toDecimals).fill(0).join('')}`)); // remove extra decimals

    return Number(numberToFormattedString(convertedBalance, {
      decimals: from.decimals,
      localize: false,
    }));
  };

  return {
    tokenConversions,
    tokenConversionsLoading: isLoading || isRefetching,
    convert,
    refetchTokenConversions,
  };
};

export default useTokenConversions;
