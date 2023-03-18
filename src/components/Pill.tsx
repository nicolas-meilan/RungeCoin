import React from 'react';
import type {
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';

import styled, { useTheme } from 'styled-components/native';

import Text, { TextProps } from './Text';

export enum Type {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  INFO = 'info',
  SUCCESS = 'success',
  ERROR = 'error',
}

type PillProps = {
  style?: StyleProp<ViewStyle | TextStyle>;
  type?: Type;
  text?: string;
  i18nArgs?: TextProps['i18nArgs'];
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  noI18n?: boolean;
};

const PillWrapper = styled.TouchableOpacity<{ color: string }>`
  border: 1px solid ${({ color }) => color};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  flex-direction: row;
`;

const PillText = styled(Text)<{ borderColor: string; color: string }>`
  color: ${({ color }) => color};
  border: 1px solid ${({ borderColor }) => borderColor};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  vertical-align: middle;
`;

const Pill = ({
  type = Type.PRIMARY,
  style,
  text,
  children,
  i18nArgs,
  onPress,
  noI18n = false,
  disabled = false,
}: PillProps) => {
  const theme = useTheme();

  if (text) {
    return (
      <PillText
        borderColor={theme.colors[type]}
        color={theme.colors[type]}
        style={style}
        noI18n={noI18n}
        text={text}
        i18nArgs={i18nArgs}
        onPress={onPress}
        disabled={disabled}
      />
    );
  }

  return (
    <PillWrapper
      color={theme.colors[type]}
      style={style}
      disabled={disabled || !onPress}
      onPress={onPress}
    >
      {children}
    </PillWrapper>
  );
};

export default Pill;
