import React from 'react';

import styled from 'styled-components/native';

import Svg, { SvgProps } from '@components/Svg';
import Text, { TextProps } from '@components/Text';

type MessageProps = {
  scroll?: boolean;
  text: TextProps['text'];
  svg: SvgProps['svg'];
  svgColor?: SvgProps['color'];
  i18nArgs?: TextProps['i18nArgs'];
};

const MessageWrapperScrollView = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
  nestedScrollEnabled: true,
})`
  flex: 1;
`;

const MessageWrapper = styled.View`
  flex: 1;
`;

const MessageText = styled(Text)`
  margin-top: ${({ theme }) => theme.spacing(4)};
  font-size: ${({ theme }) => theme.fonts.size[18]};
  vertical-align: middle;
  text-align: center;
`;

const Message = ({
  text,
  i18nArgs,
  svg,
  svgColor,
  scroll = false,
}: MessageProps) => {
  const content = (
    <>
      <Svg svg={svg} color={svgColor} />
      <MessageText text={text} i18nArgs={i18nArgs} />
    </>
  );

  if (scroll) {
    return (
      <MessageWrapperScrollView>
        {content}
      </MessageWrapperScrollView>
    );
  }

  return (
    <MessageWrapper>
      {content}
    </MessageWrapper>
  );
};

export default Message;
