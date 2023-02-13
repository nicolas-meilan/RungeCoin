import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { AvailableThemes } from '../theme/themes';
import { isDarkThemeEnabled } from '@system/deviceInfo';
import StorageKeys from '@system/storageKeys';
import { ReactQueryKeys } from '@utils/constants';

type UseThemeReturn = {
  themeMode?: AvailableThemes | null;
  setThemeMode: (theme: AvailableThemes) => void;
  themeLoading?: boolean;
  initializeTheme: () => void;
};

const useThemeConfiguration = (): UseThemeReturn => {
  const queryClient = useQueryClient();
  const { getItem, setItem } = useAsyncStorage(StorageKeys.THEME);

  const getCurrentTheme = async () => {
    const storedTheme = await getItem();

    return storedTheme as UseThemeReturn['themeMode'];
  };

  const { data: themeMode, isLoading: themeLoading } = useQuery({
    queryKey: [ReactQueryKeys.THEME],
    queryFn: getCurrentTheme,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const setStorageTheme = async (newThemeMode: AvailableThemes) => {
    if (newThemeMode !== themeMode) await setItem(newThemeMode);

    return newThemeMode;
  };

  const { mutate: mutateTheme } = useMutation({
    mutationKey: [ReactQueryKeys.THEME],
    mutationFn: setStorageTheme,
  });

  const setThemeMode = (newThemeMode: AvailableThemes) => mutateTheme(newThemeMode, {
    onSuccess: (savedThemeMode) => queryClient.setQueryData([ReactQueryKeys.THEME], savedThemeMode),
  });

  const initializeTheme = () => {
    if (!themeMode && !themeLoading) {
      const deviceThemeMode = isDarkThemeEnabled() ? AvailableThemes.DARK : AvailableThemes.LIGHT;
      setThemeMode(deviceThemeMode);
    }
  };

  return {
    themeMode,
    setThemeMode,
    themeLoading,
    initializeTheme,
  };
};

export default useThemeConfiguration;
