import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { UseQueryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import StorageKeys from '@system/storageKeys';
import { FiatCurrencies, ReactQueryKeys } from '@utils/constants';

type UseConsolidatedCurrencyReturn = {
  consolidatedCurrency?: FiatCurrencies;
  setConsolidatedCurrency: (newConsolidated: FiatCurrencies) => void;
  consolidatedCurrencyLoading: boolean;
};

type QueryOptions = UseQueryOptions<FiatCurrencies | undefined, unknown, FiatCurrencies | undefined, ReactQueryKeys[]>;
type UseConsolidatedCurrencyProps = Omit<QueryOptions, 'queryKey' | 'queryFn' | 'initialData' | 'staleTime' | 'cacheTime'>;

const useConsolidatedCurrency = (options?: UseConsolidatedCurrencyProps): UseConsolidatedCurrencyReturn => {
  const queryClient = useQueryClient();
  const { getItem, setItem } = useAsyncStorage(StorageKeys.CONSOLIDATED_CURRENCY);

  const getCurrentConsolidatedCurrency = async (): Promise<FiatCurrencies | undefined> => {
    const storedConsolidated = await getItem();

    return (storedConsolidated || FiatCurrencies.USD) as UseConsolidatedCurrencyReturn['consolidatedCurrency'];
  };

  const { data: consolidatedCurrency, isLoading } = useQuery({
    queryKey: [ReactQueryKeys.CONSOLIDATED_CURRENCY],
    queryFn: getCurrentConsolidatedCurrency,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
    cacheTime: Infinity,
    ...options,
  });

  const setStorageConsolidatedCurrency = async (newConsolidatedCurrency: FiatCurrencies) => {
    if (newConsolidatedCurrency !== consolidatedCurrency) await setItem(newConsolidatedCurrency);

    return newConsolidatedCurrency;
  };

  const { mutate: mutateConsolidatedCurrency, isLoading: mutationLoading } = useMutation({
    mutationKey: [ReactQueryKeys.THEME],
    mutationFn: setStorageConsolidatedCurrency,
  });

  const setConsolidatedCurrency = (newConsolidatedCurrency: FiatCurrencies) => (
    mutateConsolidatedCurrency(newConsolidatedCurrency, {
      onSuccess: (savedThemeMode) => queryClient.setQueryData(
        [ReactQueryKeys.CONSOLIDATED_CURRENCY],
        savedThemeMode,
      ),
    })
  );

  return {
    consolidatedCurrency,
    setConsolidatedCurrency,
    consolidatedCurrencyLoading: isLoading || mutationLoading,
  };
};

export default useConsolidatedCurrency;