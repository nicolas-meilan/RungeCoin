import React from 'react';

import { ThemeProvider as ThemeProviderSC } from 'styled-components/native';

import themes, { AvailableThemes } from './themes';
import useTheme from '@hooks/useTheme';
import { isDarkThemeEnabled } from '@system/deviceInfo';

type ThemeProviderProps = {
  children: JSX.Element;
};

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { themeMode } = useTheme();

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
