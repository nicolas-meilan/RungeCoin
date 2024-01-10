import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import useNotifications from './useNotifications';
import { Languages } from '../locale/i18nConfig';
import { ArticleResponse, getLatestNews } from '@http/news';
import { ReactQueryKeys } from '@utils/constants';
import type { TokenSymbol, TokenType } from '@web3/tokens';

type UseNewsReturn = {
  news?: ArticleResponse[] | null;
  newsLoading: boolean;
  refetchNews: () => Promise<void>;
};

type QueryKey = [ReactQueryKeys, TokenSymbol | undefined, keyof Languages];
type QueryOptions = UseQueryOptions<ArticleResponse[] | null, unknown, ArticleResponse[] | null, QueryKey>;
type UseNewsProps = {
  options?: Omit<QueryOptions, 'queryKey' | 'queryFn' | 'initialData'>;
  token?: TokenType | null;
  withResponse?: boolean;
};

const useNews = ({
  options,
  token,
  withResponse = true,
}: UseNewsProps): UseNewsReturn => {
  const queryClient = useQueryClient();

  const { dispatchNotification } = useNotifications();
  const { i18n } = useTranslation();

  const queryKey: QueryKey = [ReactQueryKeys.BALANCES, token?.symbol, i18n.language as keyof Languages];

  const fetchNews = async () => {
    if (!token) return null;

    const about = `${token.name}%20OR%20${token.name}`;

    return getLatestNews(about, i18n.language);
  };

  const onError = () => dispatchNotification('error.news', 'error');

  const {
    data: news,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: fetchNews,
    initialData: null,
    retry:false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    onError,
    ...(options || {}),
  });

  const refetchNews = async () => {
    await refetch().then(({ data }) => queryClient.setQueryData(queryKey, data));
  };

  return {
    news: withResponse ? news : null,
    newsLoading: isLoading || isRefetching,
    refetchNews,
  };
};

export default useNews;
