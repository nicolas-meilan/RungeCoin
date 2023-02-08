import {
  Colors,
  dark,
  light,
} from './colors';
import fonts, { Fonts } from './fonts';

const DEFAULT_SPACE = 4;
const DEFAULT_BORDER_RADIUS = 8;

const spacing = (n?: number) => `${!n ? DEFAULT_SPACE : (DEFAULT_SPACE * n)}px`;
const spacingNative = (n?: number) => (!n ? DEFAULT_SPACE : (DEFAULT_SPACE * n));

const theme = {
  spacing,
  spacingNative,
  fonts,
  borderRadius: `${DEFAULT_BORDER_RADIUS}px`,
};

export enum AvailableThemes {
  DARK = 'dark',
  LIGHT = 'light',
  FROM_DEVICE = 'fromDevice',
}

export type AvailableThemesType = Exclude<AvailableThemes, AvailableThemes.FROM_DEVICE>;

export type Theme = {
  spacing: (n?: number) => string;
  spacingNative: (n?: number) => number;
  borderRadius: string;
  fonts: Fonts;
  colors: Colors;
};

const themes: {
  [availableTheme in AvailableThemesType]: Theme;
} = {
  [AvailableThemes.LIGHT]: {
    ...theme,
    colors: light,
  },
  [AvailableThemes.DARK]: {
    ...theme,
    colors: dark,
  },
};

export default themes;