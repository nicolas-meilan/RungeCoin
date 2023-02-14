import React from 'react';
import type { ImageProps } from 'react-native';

import styled from 'styled-components/native';

import Svg, { SvgProps } from '@components/Svg';
import Text, { TextProps } from '@components/Text';

type MessageProps = {
  scroll?: boolean;
  text: TextProps['text'];
  svg?: SvgProps['svg'];
  svgColor?: SvgProps['color'];
  i18nArgs?: TextProps['i18nArgs'];
  image?: ImageProps['source'];
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

const ImageWrapper = styled.View`
  flex: 1
`;

const Image = styled.Image`
  height: 100%;
  width: 100%;
  resize-mode: center;
`;

const Message = ({
  text,
  i18nArgs,
  svg,
  svgColor,
  image,
  scroll = false,
}: MessageProps) => {
  const media = svg
    ? <Svg svg={svg} color={svgColor} />
    : (!!image && <ImageWrapper><Image source={image} /></ImageWrapper>);

  const content = (
    <>
      {media}
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
