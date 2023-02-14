import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import StorageKeys from '@system/storageKeys';
import { ReactQueryKeys } from '@utils/constants';
import {
  deviceHasBiometrics,
  obtainBiometrics,
  toggleBiometrics,
} from '@utils/security';

type UseBiometricsReturn = {
  biometricsEnabled?: boolean | null;
  biometricsEnabledLoading: boolean;
  setBiometrics: (enabled: boolean) => void;
  dispatchBiometrics: () => Promise<boolean>;
  deviceHasBiometrics: () => Promise<boolean>;
};

type UseBiometricsProps = {
  onBiometricsChangeCancel?: () => void;
  onBiometricsChaingeSuccess?: () => void;
};

const useBiometrics = ({
  onBiometricsChangeCancel,
  onBiometricsChaingeSuccess,
}: UseBiometricsProps = {}): UseBiometricsReturn => {
  const queryClient = useQueryClient();
  const { getItem, setItem } = useAsyncStorage(StorageKeys.BIOMETRICS);

  const getBiometricsEnabled = async () => {
    const biometricsEnabledStored = await getItem();
    return biometricsEnabledStored === 'true';
  };

  const {
    data: biometricsEnabled,
    isLoading: biometricsEnabledLoading,
  } = useQuery({
    queryKey: [ReactQueryKeys.BIOMETRICS],
    queryFn: getBiometricsEnabled,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const dispatchBiometrics = async (ignoreEnableFlag = false) => {
    if (!ignoreEnableFlag && !biometricsEnabled) return false;

    try {
      const biometicsEnabled = await obtainBiometrics();

      return !!biometicsEnabled;
    } catch (_) {
      return false;
    }
  };

  const setBiometricsMutation = async (enable: boolean) => {
    if (!enable) {
      const grantAccess = await dispatchBiometrics(true);
      if (!grantAccess) {
        onBiometricsChangeCancel?.();

        return biometricsEnabled;
      }

      await toggleBiometrics(false);
      await setItem(String(false));
      onBiometricsChaingeSuccess?.();
      return false;
    }

    await toggleBiometrics(true);
    const grantAccess = await dispatchBiometrics(true);
    if (!grantAccess) {
      await toggleBiometrics(false);
      onBiometricsChangeCancel?.();
      return biometricsEnabled;
    }
    await setItem(String(true));
    onBiometricsChaingeSuccess?.();

    return true;
  };

  const { mutate: mutateBiometrics } = useMutation({
    mutationKey: [ReactQueryKeys.BIOMETRICS],
    mutationFn: setBiometricsMutation,
  });

  const setBiometrics = (enable: boolean) => mutateBiometrics(enable, {
    onSuccess: (newEnable?: boolean) => queryClient.setQueryData([ReactQueryKeys.BIOMETRICS], newEnable),
  });

  return {
    biometricsEnabled,
    biometricsEnabledLoading,
    setBiometrics,
    dispatchBiometrics,
    deviceHasBiometrics,
  };
};

export default useBiometrics;