import React from 'react';
import type { StyleProp, TextStyle } from 'react-native';

import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

export enum Weight {
  REGULAR = 'normal',
  BOLD = 'bold',
}

type TextProps = {
  text: string;
  style?: StyleProp<TextStyle>;
  children?: JSX.Element | JSX.Element[];
  weight?: Weight;
};

const StyledText = styled.Text`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fonts.size[14]};
`;

const Text = ({
  text: i18nKey = '',
  weight = Weight.REGULAR,
  children,
  style,
}: TextProps) => {
  const { t } = useTranslation();

  if (children) return (
    <StyledText style={[{ fontWeight: weight }, style]}>
      {children}
    </StyledText>
  );

  const text = t(i18nKey);

  return (
    <StyledText style={[{ fontWeight: weight }, style]}>
      {text}
    </StyledText>
  );
};

export default Text;