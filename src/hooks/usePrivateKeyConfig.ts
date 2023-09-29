import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import StorageKeys from '@system/storageKeys';
import { ReactQueryKeys } from '@utils/constants';

type UsePrivateKeyConfigReturn = {
  hasDoubleEncryption: boolean;
  setPrivateKeyDoubleEncryption: (newValue: boolean) => void;
  privateKeyConfigLoading: boolean;
};

const usePrivateKeyConfig = (): UsePrivateKeyConfigReturn => {
  const queryClient = useQueryClient();
  const { getItem, setItem } = useAsyncStorage(StorageKeys.PRIVATE_KEY_CONFIG);

  const getHasDoubleEncryption = async () => {
    const storedHasDoubleEncryption = await getItem();

    return storedHasDoubleEncryption?.toLowerCase() === 'true';
  };

  const { data: hasDoubleEncryption, isLoading } = useQuery({
    queryKey: [ReactQueryKeys.PRIVATE_KEY_CONFIG],
    queryFn: getHasDoubleEncryption,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const setHasDoubleEncryption = async (newValue: boolean) => {
    if (newValue !== hasDoubleEncryption) await setItem(newValue.toString());

    return newValue;
  };

  const { mutate: mutateDoubleEncryption, isLoading: mutationLoading } = useMutation({
    mutationKey: [ReactQueryKeys.PRIVATE_KEY_CONFIG],
    mutationFn: setHasDoubleEncryption,
  });

  const setPrivateKeyDoubleEncryption: UsePrivateKeyConfigReturn['setPrivateKeyDoubleEncryption']
    = (newValue) => mutateDoubleEncryption(newValue, {
      onSuccess: (savedValue) => queryClient.setQueryData([ReactQueryKeys.PRIVATE_KEY_CONFIG], savedValue),
    });

  return {
    hasDoubleEncryption: !!hasDoubleEncryption,
    setPrivateKeyDoubleEncryption,
    privateKeyConfigLoading: isLoading || mutationLoading,
  };
};

export default usePrivateKeyConfig;
