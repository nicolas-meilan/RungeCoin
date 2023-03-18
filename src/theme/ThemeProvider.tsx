import React from 'react';

import { ThemeProvider as ThemeProviderSC } from 'styled-components/native';

import themes, { AvailableThemes } from './themes';
import useThemeConfiguration from '@hooks/useThemeConfiguration';
import { isDarkThemeEnabled } from '@system/deviceInfo';

type ThemeProviderProps = {
  children: React.ReactNode;
};

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { themeMode } = useThemeConfiguration();

  const deviceThemeMode = isDarkThemeEnabled() ? AvailableThemes.DARK : AvailableThemes.LIGHT;

  const themeModeToRender = !themeMode || themeMode === AvailableThemes.FROM_DEVICE
    ? deviceThemeMode
    : themeMode;

  return (
    <ThemeProviderSC theme={themes[themeModeToRender]}>
      {children}
    </ThemeProviderSC>
  );
};

export default ThemeProvider;
