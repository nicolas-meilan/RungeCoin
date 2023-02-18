import {
  Colors,
  dark,
  light,
} from './colors';
import fonts, { Fonts } from './fonts';

const DEFAULT_SPACE = 4;
export const DEFAULT_BORDER_RADIUS = 8;

export const INPUT_HEIGHT_SMALL = 50;
export const INPUT_HEIGHT_BIG = 130;

const spacing = (n?: number) => `${!n ? DEFAULT_SPACE : (DEFAULT_SPACE * n)}px`;
const spacingNative = (n?: number) => (!n ? DEFAULT_SPACE : (DEFAULT_SPACE * n));

const theme = {
  spacing,
  spacingNative,
  inputsHeight: {
    small: `${INPUT_HEIGHT_SMALL}px`,
    big: `${INPUT_HEIGHT_BIG}px`,
  },
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
  inputsHeight: {
    small: string;
    big: string;
  };
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