import React from 'react';

import styled from 'styled-components/native';

import Text, { TextProps, Weight } from './Text';

type TitleProps = {
  title: string;
  style?: TextProps['style'];
  i18nArgs?: TextProps['i18nArgs'];
  noI18n?: boolean;
};

const StyledText = styled(Text)`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fonts.size[40]};
`;

const Title = ({
  i18nArgs,
  noI18n,
  title,
  style,
}: TitleProps) => (
  <StyledText text={title} style={style} noI18n={noI18n} i18nArgs={i18nArgs} weight={Weight.BOLD}/>
);

export default Title;
