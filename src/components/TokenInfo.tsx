import React, { useEffect } from 'react';
import { FlatListProps } from 'react-native';

import styled from 'styled-components/native';

import ArticleCard from './ArticleCard';
import Skeleton from './Skeleton/Skeleton';
import Text from './Text';
import TradingViewChart from './TradingViewChart';
import useNews from '@hooks/useNews';
import type { TokenType } from '@web3/tokens';

const StyledScrollView = styled.ScrollView`
  flex: 1;
`;

const NewsTitle = styled(Text)`
  margin-top: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.fonts.size[20]};
`;

const StyledArticle = styled(ArticleCard)`
  margin-vertical: ${({ theme }) => theme.spacing(2)};
`;

type TokenInfoProps = {
  token?: TokenType | null;
  refreshControl: FlatListProps<any>['refreshControl'];
};

const TokenInfo = ({
  token,
  refreshControl,
}: TokenInfoProps) => {
  const {
    newsLoading,
    refetchNews,
    news,
  } = useNews({
    token,
  });

  useEffect(() => {
    if (!news || !news.length) refetchNews();
  }, []);

  return (
    <StyledScrollView refreshControl={refreshControl}>
      <TradingViewChart token={token} />
      <NewsTitle text='main.token.info.news' />
      <Skeleton
        isLoading={!news && newsLoading}
        quantity={6}
      >
        {!!news && news?.map((article) => (
          <StyledArticle
            key={article.articleUrl}
            article={article}
          />
        ))}
      </Skeleton>
    </StyledScrollView>
  );
};

export default TokenInfo;
