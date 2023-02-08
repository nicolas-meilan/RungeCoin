import React from 'react';
import type { StyleProp, TextStyle } from 'react-native';

import styled from 'styled-components/native';

import Text from './Text';

type TitleProps = {
  title: string;
  style?: StyleProp<TextStyle>;
};

const StyledText = styled(Text)`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fonts.size[40]};
`;

const Title = ({ title, style }: TitleProps) => (
  <StyledText text={title} style={style} />
);

export default Title;
