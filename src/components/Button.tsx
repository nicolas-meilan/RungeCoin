import React from 'react';
import { ActivityIndicator, StyleProp, TextStyle, ViewStyle } from 'react-native';

import styled, { useTheme } from 'styled-components/native';

import Text, { TextProps, Weight } from './Text';

export enum ButtonType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TERTIARY = 'tertiary',
}
type ButtonProps = {
  text: string;
  i18nArgs?: TextProps['i18nArgs'];
  onPress: () => void;
  type?: ButtonType;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

const ButtonWrapper = styled.TouchableOpacity`
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing(2)};
  align-items: center;
  justify-content: center;
  height: ${({ theme }) => theme.inputsHeight.small};
`;

const ButtonText = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[16]};
`;

const Button = ({
  text,
  onPress,
  style,
  i18nArgs,
  loading = false,
  disabled = false,
  type = ButtonType.PRIMARY,
}: ButtonProps) => {
  const theme = useTheme();

  const styleByType: {
    [key in ButtonType]: {
      button: StyleProp<ViewStyle>;
      text: StyleProp<TextStyle> & {
        color?: string;
      };
    }
  } = {
    [ButtonType.PRIMARY]: {
      button: {
        backgroundColor: theme.colors.primary,
      },
      text: {
        color: theme.colors.text.inverted,
      },
    },
    [ButtonType.SECONDARY]: {
      button: {
        backgroundColor: theme.colors.secondary,
      },
      text: {
        color: theme.colors.text.primary,
      },
    },
    [ButtonType.TERTIARY]: {
      button: {
        borderColor: theme.colors.info,
        borderStyle: 'solid',
        borderWidth: 1,
      },
      text: {
        color: theme.colors.info,
      },
    },
  };
  const disabledColorStyleButton = disabled ? {
    backgroundColor: theme.colors.disabled,
    borderWidth: 0,
  } : {};
  const disabledColorStyleText = disabled ? {
    color: theme.colors.text.inverted,
  } : {};

  return (
    <ButtonWrapper
      disabled={disabled || loading}
      onPress={onPress}
      style={[styleByType[type].button, style, disabledColorStyleButton]}
    >
      {!loading && (
        <ButtonText
          text={text}
          weight={Weight.BOLD}
          i18nArgs={i18nArgs}
          style={[styleByType[type].text, disabledColorStyleText]}
        />
      )}
      {loading && (
        <ActivityIndicator
          color={styleByType[type].text?.color || theme.colors.text.primary}
        />
      )}
    </ButtonWrapper>
  );
};

export default Button;
