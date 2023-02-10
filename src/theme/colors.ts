export type Colors = {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  disabled: string;
  border: string;
  background: {
    primary: string;
    secondary: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverted: string;
  };
  transparent: string;
  statics: {
    white: string;
  };
};

export const light: Colors = {
  primary: '#00317A',
  secondary: '#05A7FF',
  success: '#51C11D',
  warning: '#FF8307',
  error: '#FF0004',
  info: '#05A7FF',
  disabled: '#8a8a8a',
  border: '#C5CAE0',
  background: {
    primary: '#FFFFFF',
    secondary: '#F7F8FC',
  },
  text: {
    primary: '#101426',
    secondary: '#646D84',
    tertiary: '#C5CAE0',
    inverted: '#FFFFFF',
  },
  transparent: 'transparent',
  statics: {
    white: '#FFFFFF',
  },
};

export const dark: Colors = {
  primary: '#39FF14',
  secondary: '#9D00FF',
  success:'#51C11D',
  warning: '#FF8307',
  error: '#FF0004',
  info: '#05A7FF',
  disabled: '#8a8a8a',
  border: '#C5CAE0',
  background: {
    primary: '#000000',
    secondary: '#323235',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#E4E7F2',
    tertiary: '#C5CAE0',
    inverted: '#101426',
  },
  transparent: 'transparent',
  statics: {
    white: '#FFFFFF',
  },
};
