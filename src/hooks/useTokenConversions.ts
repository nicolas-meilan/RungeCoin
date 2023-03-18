import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { BigNumber, utils } from 'ethers';

import { getTokenConversions, TokenConversionsEndpointResponse } from '@http/tokens';
import { ReactQueryKeys } from '@utils/constants';
import { numberToFormattedString } from '@utils/formatter';
import type { TokenType } from '@web3/tokens';

type TokenConversion = TokenConversionsEndpointResponse['data'];

type UseTokenConversionssReturn = {
  tokenConversions?: TokenConversion | null;
  tokenConversionsLoading: boolean;
  convert: (balance: number | BigNumber, from: Omit<TokenType, 'name' | 'address'>) => number;
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
    const balanceToConvert = BigNumber.isBigNumber(balance) ? balance : BigNumber.from(balance);

    if (!tokenConversions || balanceToConvert.isZero()) return 0;

    // TODO select to
    const to = tokenConversions[from.symbol]?.USD || 0;
    const toDecimals = to.toString().split('.')?.[1]?.length || 0;

    const convertedBalance = balanceToConvert
      .mul(utils.parseUnits(to.toString(), toDecimals)) // add extra decimals for multiplication
      .div(BigNumber.from(`1${new Array(toDecimals).fill(0).join('')}`)); // remove extra decimals

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
