import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import StorageKeys from '@system/storageKeys';
import { ReactQueryKeys } from '@utils/constants';
import {
  deviceHasBiometrics,
  obtainBiometrics,
  toggleBiometrics,
} from '@utils/security';

type UseBiometricsProps = {
  biometricsEnabled?: boolean | null;
  biometricsEnabledLoading: boolean;
  setBiometrics: (enabled: boolean) => void;
  dispatchBiometrics: () => Promise<boolean>;
  deviceHasBiometrics: () => Promise<boolean>;
};

const useBiometrics = (): UseBiometricsProps => {
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
      if (!grantAccess) return biometricsEnabled;

      await toggleBiometrics(false);
      await setItem(String(false));
    
      return false;
    }

    await toggleBiometrics(true);
    const grantAccess = await dispatchBiometrics(true);
    if (!grantAccess) return biometricsEnabled;
    await setItem(String(true));

    return true;
  };

  const { mutate: mutateBiometrics } = useMutation({
    mutationKey: [ReactQueryKeys.BIOMETRICS],
    mutationFn: setBiometricsMutation,
  });

  const setBiometrics = (enable: boolean) => mutateBiometrics(enable, {
    onSuccess: () => queryClient.setQueryData([ReactQueryKeys.BIOMETRICS], enable),
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
