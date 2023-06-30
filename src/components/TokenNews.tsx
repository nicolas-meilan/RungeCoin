import React, { useEffect } from 'react';
import { FlatListProps } from 'react-native';

import styled from 'styled-components/native';

import ArticleCard from './ArticleCard';
import ErrorWrapper from './ErrorWrapper';
import Skeleton from './Skeleton/Skeleton';
import useNews from '@hooks/useNews';
import { NEWS_PAGE_SIZE } from '@http/news';
import type { TokenType } from '@web3/tokens';

const StyledScrollView = styled.ScrollView`
  flex: 1;
`;
const StyledArticle = styled(ArticleCard)`
  margin-vertical: ${({ theme }) => theme.spacing(2)};
`;

type TokenNewsProps = {
  token?: TokenType | null;
  refreshControl: FlatListProps<any>['refreshControl'];
  retryNews: () => void;
};

const TokenNews = ({
  token,
  refreshControl,
  retryNews,
}: TokenNewsProps) => {
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
      <Skeleton
        isLoading={!news && newsLoading}
        quantity={NEWS_PAGE_SIZE}
      >
        <ErrorWrapper
          requiredValuesToRender={[token, news]}
          title="error.news"
          message="common.tryRefresh"
          retryCallback={retryNews}
          height={400}
        >
          {!!news && news?.map((article) => (
            <StyledArticle
              key={article.articleUrl}
              article={article}
            />
          ))}
        </ErrorWrapper>
      </Skeleton>
    </StyledScrollView>
  );
};

export default TokenNews;
