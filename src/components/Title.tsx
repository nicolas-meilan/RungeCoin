import React from 'react';

import styled from 'styled-components/native';

import Text, { TextProps } from './Text';

type TitleProps = {
  title: string;
  style?: TextProps['style'];
  i18nArgs?: TextProps['i18nArgs'];
  noI18n?: boolean;
  isSubtitle?: boolean;
};

const StyledText = styled(Text)<{ isSubtitle?: boolean }>`
  ${({ isSubtitle, theme }) => (isSubtitle ? `
    color: ${theme.colors.text.primary};
    font-size: ${theme.fonts.size[24]};
  ` : `
    color: ${theme.colors.primary};
    font-size: ${theme.fonts.size[40]};
  `)}
`;

const Title = ({
  i18nArgs,
  noI18n,
  title,
  isSubtitle,
  style,
}: TitleProps) => (
  <StyledText
    isSubtitle={isSubtitle}
    text={title}
    style={style}
    noI18n={noI18n}
    i18nArgs={i18nArgs}
    weight={isSubtitle ? 'normal' : 'bold'}
  />
);

export default Title;
