import {
  Colors,
  dark,
  light,
} from './colors';

const DEFAULT_SPACE = 4;
const DEFAULT_BORDER_RADIUS = 16;

const spacing = (n?: number) => `${!n ? DEFAULT_SPACE : (DEFAULT_SPACE * n)}px`;

const theme = {
  spacing,
  borderRadius: `${DEFAULT_BORDER_RADIUS}px`,
};

export enum AvailableThemes {
  DARK = 'dark',
  LIGHT = 'light',
}

export type Theme = {
  spacing: (n?: number) => string;
  borderRadius: string;
  colors: Colors;
};

const themes: {
  [availableTheme in AvailableThemes]: Theme;
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