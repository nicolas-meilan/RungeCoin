import React from 'react';

import { ThemeProvider as ThemeProviderST } from 'styled-components/native';

import themes, { AvailableThemes } from './themes';
import { isDarkThemeEnabled } from '@system/deviceInfo';

type ThemeProviderProps = {
  children: JSX.Element;
};

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const deviceUseDarkTheme = isDarkThemeEnabled();

  const themeMode = deviceUseDarkTheme ? AvailableThemes.DARK : AvailableThemes.LIGHT;

  return (
    <ThemeProviderST theme={themes[themeMode]}>
      {children}
    </ThemeProviderST>
  );
};

export default ThemeProvider;
