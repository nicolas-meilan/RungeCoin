import type { Theme } from '../theme/themes';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme { }
}
