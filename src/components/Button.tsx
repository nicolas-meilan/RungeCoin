import React from 'react';
import { ActivityIndicator, StyleProp, TextStyle, ViewStyle } from 'react-native';

import styled, { useTheme } from 'styled-components/native';

import Icon from './Icon';
import Text, { TextProps } from './Text';

type ButtonType = 'primary' | 'secondary' | 'tertiary';

type ButtonProps = {
  text: string;
  i18nArgs?: TextProps['i18nArgs'];
  onPress: () => void;
  type?: ButtonType;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: StyleProp<ViewStyle>;
};

const ButtonWrapper = styled.TouchableOpacity`
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing(2)};
  align-items: center;
  justify-content: center;
  height: ${({ theme }) => theme.inputsHeight.small};
`;

const ContentWrapper = styled.View`
  flex-direction: row;
  align-items: center;
`;

const ButtonText = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[16]};
`;

const BottonIcon = styled(Icon)`
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

const Button = ({
  text,
  onPress,
  style,
  i18nArgs,
  icon,
  loading = false,
  disabled = false,
  type = 'primary',
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
    primary: {
      button: {
        backgroundColor: theme.colors.primary,
      },
      text: {
        color: theme.colors.text.inverted,
      },
    },
    secondary: {
      button: {
        borderColor: theme.colors.secondary,
        borderStyle: 'solid',
        borderWidth: 1,
      },
      text: {
        color: theme.colors.secondary,
      },
    },
    tertiary: {
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
        <ContentWrapper>
          {icon && (
            <BottonIcon
              name={icon}
              style={[styleByType[type].text, disabledColorStyleText]}
            />
          )}
          <ButtonText
            text={text}
            weight="bold"
            i18nArgs={i18nArgs}
            style={[styleByType[type].text, disabledColorStyleText]}
          />
        </ContentWrapper>
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
