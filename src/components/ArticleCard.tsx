import React from 'react';
import {
  Linking,
  ImageBackground,
  ImageBackgroundProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

import styled from 'styled-components/native';

import Text from './Text';
import defaultArticleImage from '@assets/images/defaultArticle.png';
import { ArticleResponse } from '@http/news';

type ArticleCardProps = {
  article: ArticleResponse;
  style?: StyleProp<ViewStyle>;
};

const CARD_HEIGHT = 150;

const ArticleCardWrapper = styled.TouchableOpacity`
  width: 100%;
  height: ${CARD_HEIGHT}px;
  border-radius: ${({ theme }) => theme.borderRadius};
  overflow: hidden;
`;

const Background = styled(ImageBackground)`
  flex: 1;
`;

const Overlay = styled.View`
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.7;
  background-color: ${({ theme }) => theme.colors.statics.black};
`;

const Title = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[16]};
  color: ${({ theme }) => theme.colors.statics.white};
`;

const Author = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[12]};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Content = styled.View`
  flex: 1;
  justify-content: space-between;
  margin: ${({ theme }) => theme.spacing(2)};
`;

const ArticleCard = ({
  article,
  style,
}: ArticleCardProps) => {
  const backgroundSrc = (article.imageUrl
    ? { uri: article.imageUrl }
    : defaultArticleImage) as unknown as ImageBackgroundProps['source'];

  const onPress = () => Linking.openURL(article.articleUrl);

  return (
    <ArticleCardWrapper style={style} onPress={onPress}>
      <Background
        source={backgroundSrc}
      >
        <Overlay />
        <Content>
          <Title text={article.title} />
          <Author text={article.author} />
        </Content>
      </Background>
    </ArticleCardWrapper>
  );
};

export default ArticleCard;
