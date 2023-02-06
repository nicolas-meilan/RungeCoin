import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme as useThemeSC } from 'styled-components/native';

import { AvailableThemes, Theme } from '../theme/themes';
import { isDarkThemeEnabled } from '@system/deviceInfo';
import StorageKeys from '@system/storageKeys';

const THEME_QUERY_KEY = 'theme';

type UseThemeReturn = {
  theme: Theme;
  themeMode?: AvailableThemes | null;
  setThemeMode: (theme: AvailableThemes) => void;
  themeLoading?: boolean;
  initializeTheme: () => void;
};

const useTheme = (): UseThemeReturn => {
  const theme = useThemeSC();
  const queryClient = useQueryClient();
  const { getItem, setItem } = useAsyncStorage(StorageKeys.THEME);

  const getCurrentTheme = async () => {
    const storedTheme = await getItem();

    return storedTheme as UseThemeReturn['themeMode'];
  };

  const { data: themeMode, isLoading: themeLoading } = useQuery({
    queryKey: [THEME_QUERY_KEY],
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
    mutationKey: [THEME_QUERY_KEY],
    mutationFn: setStorageTheme,
  });

  const setThemeMode = (newThemeMode: AvailableThemes) => mutateTheme(newThemeMode, {
    onSuccess: (savedThemeMode) => queryClient.setQueryData([THEME_QUERY_KEY], savedThemeMode),
  });

  const initializeTheme = () => {
    if (!themeMode && !themeLoading) {
      const deviceThemeMode = isDarkThemeEnabled() ? AvailableThemes.DARK : AvailableThemes.LIGHT;
      setThemeMode(deviceThemeMode);
    }
  };

  return {
    theme,
    themeMode,
    setThemeMode,
    themeLoading,
    initializeTheme,
  };
};

export default useTheme;
