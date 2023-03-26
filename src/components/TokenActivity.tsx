import React, { useEffect, useState } from 'react';
import { FlatList, FlatListProps } from 'react-native';

import styled, { useTheme } from 'styled-components/native';

import ErrorWrapper from './ErrorWrapper';
import Skeleton from './Skeleton';
import TokenActivityItem from './TokenActivityItem';
import useWalletActivity from '@hooks/useWalletActivity';
import type { TokenType } from '@web3/tokens';

type TokenActivityProps = {
  token?: TokenType | null;
  retry: () => void;
  refreshControl: FlatListProps<any>['refreshControl'];
};

const WAIT_UNTIL_LIST_LOADED_TIME = 500;

const ListLoading = styled.ActivityIndicator`
  margin: ${({ theme }) => theme.spacing(4)};
`;

const TokenActivity = ({
  token,
  refreshControl,
  retry,
}: TokenActivityProps) => {
  const theme = useTheme();
  const [dataLoaded, setDataLoaded] = useState(false);
  const [errorRetryLoading, setErrorRetryLoading] = useState(false);
  const [timeFinish, setTimeFinish] = useState(false);

  const {
    refetchTokenActivity,
    tokenActivity,
    next,
    tokenActivityLoading,
  } = useWalletActivity({
    tokenAddress: token?.address || '',
  });

  useEffect(() => {
    const timeRef = setTimeout(() => { // Wait a time for list loading
      setTimeFinish(true);
      clearTimeout(timeRef);
    }, WAIT_UNTIL_LIST_LOADED_TIME);

    if (!tokenActivity) {
      refetchTokenActivity();
      return;
    }
    setDataLoaded(true);
  }, []);

  useEffect(() => {
    if (!tokenActivityLoading) setErrorRetryLoading(false);
  }, [tokenActivityLoading]);

  const renderListLoading = tokenActivityLoading && !!tokenActivity.length;

  const handleRetry = () => {
    setErrorRetryLoading(true);
    retry();
  };

  return (
    <Skeleton
      quantity={15}
      isLoading={(!dataLoaded && tokenActivityLoading) || !timeFinish || errorRetryLoading}
    >
      <FlatList
        refreshControl={refreshControl}
        data={timeFinish ? tokenActivity : []}
        renderItem={({ item, index }) => <TokenActivityItem activityItem={item} firstItem={!index} />}
        keyExtractor={(item) => item.hash}
        onEndReached={next}
        ListEmptyComponent={(
          <ErrorWrapper
            requiredValuesToRender={[null]}
            title="main.token.activity.emptyTitle"
            message={token ? 'main.token.activity.emptyMessage' : ''}
            retryCallback={token ? handleRetry : undefined}
            height={400}
          >
            <></>
          </ErrorWrapper>
        )}
        {...(renderListLoading
          ? { ListFooterComponent: <ListLoading color={theme.colors.info} size={32} /> }
          : null
        )}
      />
    </Skeleton>
  );
};

export default TokenActivity;
