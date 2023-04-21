import React from 'react';
import type { ImageProps, StyleProp, ViewStyle } from 'react-native';

import styled from 'styled-components/native';

import Svg, { SvgProps } from '@components/Svg';
import Text, { TextProps } from '@components/Text';

const MIN_HEIGHT_IMAGE = 250;

type MessageProps = {
  scroll?: boolean;
  text: TextProps['text'];
  svg?: SvgProps['svg'];
  svgColor?: SvgProps['color'];
  i18nArgs?: TextProps['i18nArgs'];
  image?: ImageProps['source'];
  style?: StyleProp<ViewStyle>;
  noFlex?: boolean;
};

const MessageWrapperScrollView = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
  nestedScrollEnabled: true,
})<{ noFlex?: boolean }>`
  ${({ noFlex }) => (noFlex ? '' : 'flex: 1;')}
`;

const MessageWrapper = styled.View<{ noFlex?: boolean }>`
  ${({ noFlex }) => (noFlex ? '' : 'flex: 1;')}
`;

const MessageText = styled(Text)`
  margin-top: ${({ theme }) => theme.spacing(4)};
  font-size: ${({ theme }) => theme.fonts.size[18]};
  vertical-align: middle;
  text-align: center;
`;

const ImageWrapper = styled.View`
  flex: 1;
  min-height: ${MIN_HEIGHT_IMAGE}px;
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
  style,
  noFlex = false,
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
      <MessageWrapperScrollView noFlex={noFlex} style={style}>
        {content}
      </MessageWrapperScrollView>
    );
  }

  return (
    <MessageWrapper noFlex={noFlex} style={style}>
      {content}
    </MessageWrapper>
  );
};

export default Message;
