import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import StorageKeys from '@system/storageKeys';
import { ReactQueryKeys } from '@utils/constants';
import {
  deviceHasBiometrics,
  obtainBiometrics,
  toggleBiometrics,
} from '@utils/security';
import { delay } from '@utils/time';

type UseBiometricsReturn = {
  biometricsEnabled: boolean;
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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { getItem, setItem } = useAsyncStorage(StorageKeys.BIOMETRICS);

  const getBiometricsEnabled = async () => {
    const biometricsEnabledStored = await getItem();

    return biometricsEnabledStored === 'true';
  };

  const {
    data: biometricsEnabled,
    isLoading,
  } = useQuery({
    queryKey: [ReactQueryKeys.BIOMETRICS],
    queryFn: getBiometricsEnabled,
    initialData: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const dispatchBiometrics = async (ignoreEnableFlag = false) => {
    if (!ignoreEnableFlag && !biometricsEnabled) return false;

    try {
      const biometicsEnabled = await obtainBiometrics(t('access.biometrics.title'), t('common.cancel'));

      return !!biometicsEnabled;
    } catch (_) {
      return false;
    }
  };

  const setBiometricsMutation = async (enable: boolean) => {
    await delay(0.0001); // react-native-keychain freeze the app when use biometrics
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

  const { mutate: mutateBiometrics, isLoading: mutationLoading } = useMutation({
    mutationKey: [ReactQueryKeys.BIOMETRICS],
    mutationFn: setBiometricsMutation,
  });

  const setBiometrics = (enable: boolean) => mutateBiometrics(enable, {
    onSuccess: (newEnable?: boolean) => queryClient.setQueryData([ReactQueryKeys.BIOMETRICS], newEnable),
  });

  return {
    biometricsEnabled,
    biometricsEnabledLoading: isLoading || mutationLoading,
    setBiometrics,
    dispatchBiometrics,
    deviceHasBiometrics,
  };
};

export default useBiometrics;
