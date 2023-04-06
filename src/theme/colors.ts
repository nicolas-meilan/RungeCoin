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
    inverted: string;
  };
  transparent: string;
  statics: {
    white: string;
    black: string;
  };
};

export const light: Colors = {
  primary: '#00CC66',
  secondary: '#D600FF',
  success: '#00CC00',
  warning: '#FFB84D',
  error: '#FF4D4D',
  info: '#4DA6FF',
  disabled: '#8a8a8a',
  border: '#C5CAE0',
  background: {
    primary: '#FFFFFF',
    secondary: '#F2F2F2',
  },
  text: {
    primary: '#000000',
    secondary: '#A6A6A6',
    inverted: '#FFFFFF',
  },
  transparent: 'transparent',
  statics: {
    white: '#FFFFFF',
    black: '#000000',
  },
};

export const dark: Colors = {
  primary: '#00FF7F',
  secondary: '#FF00FF',
  success:'#00CC00',
  warning: '#FFB84D',
  error: '#FF4D4D',
  info: '#4DA6FF',
  disabled: '#8a8a8a',
  border: '#A6A6A6',
  background: {
    primary: '#000000',
    secondary: '#1e1e1e',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#A6A6A6',
    inverted: '#2F2F2F',
  },
  transparent: 'transparent',
  statics: {
    white: '#FFFFFF',
    black: '#000000',
  },
};
