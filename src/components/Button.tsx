import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import styled, { useTheme } from 'styled-components/native';

import Text, { Weight } from './Text';

export enum ButtonType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
}
type ButtonProps = {
  text: string;
  onPress: () => void;
  type?: ButtonType;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const ButtonWrapper = styled.TouchableOpacity<{ color: string }>`
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme, disabled, color }) => (disabled ? theme.colors.disabled : color)};
  padding: ${({ theme }) => theme.spacing(2)};
  align-items: center;
  justify-content: center;
  height: ${({ theme }) => theme.inputsHeight.small};
`;

const ButtonText = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[16]};
  color: ${({ theme }) => theme.colors.text.inverted};
`;

const Button = ({
  text,
  onPress,
  style,
  disabled = false,
  type = ButtonType.PRIMARY,
}: ButtonProps) => {
  const theme = useTheme();

  return (
    <ButtonWrapper disabled={disabled} onPress={onPress} color={theme.colors[type]} style={style}>
      <ButtonText text={text} weight={Weight.BOLD} />
    </ButtonWrapper>
  );
};

export default Button;
