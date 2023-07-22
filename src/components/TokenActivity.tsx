import React, { useEffect, useState } from 'react';
import { FlatList, FlatListProps } from 'react-native';

import styled, { useTheme } from 'styled-components/native';

import ErrorWrapper from './ErrorWrapper';
import Skeleton from './Skeleton';
import Text from './Text';
import TokenActivityItem from './TokenActivityItem';
import useMiningPendingTxs from '@hooks/useMiningPendingTxs';
import useNotifications from '@hooks/useNotifications';
import useWalletActivity from '@hooks/useWalletActivity';
import type { WalletTx } from '@http/tx/types';
import type { TokenType } from '@web3/tokens';

type TokenActivityProps = {
  token?: TokenType | null;
  retryTokenActivity: () => void;
  refreshControl: FlatListProps<any>['refreshControl'];
};

const WAIT_UNTIL_LIST_LOADED_TIME = 250;

const ListLoading = styled.ActivityIndicator`
  margin: ${({ theme }) => theme.spacing(4)};
`;

const Subtitle = styled(Text)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledSkeleton = styled(Skeleton)`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyleFlatList = styled(FlatList)`
  margin-bottom: ${({ theme }) => theme.spacing(10)};
`;

const TokenActivity = ({
  token,
  refreshControl,
  retryTokenActivity,
}: TokenActivityProps) => {
  const theme = useTheme();

  const { dispatchNotification } = useNotifications();
  const [dataLoaded, setDataLoaded] = useState(false);
  const [errorTokenActivityRetryLoading, setErrorTokenActivityRetryLoading] = useState(false);
  const [timeFinish, setTimeFinish] = useState(false);

  const {
    refetchTokenActivity,
    tokenActivity,
    next,
    tokenActivityLoading,
  } = useWalletActivity({
    tokenAddress: token?.address || '',
  });

  const {
    txs,
    txsLoading,
    updateTxs,
  } = useMiningPendingTxs({
    onUpdateError: () => dispatchNotification('error.miningPendingTxs', 'error'),
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

    updateTxs();
    setDataLoaded(true);
  }, []);

  useEffect(() => {
    if (!tokenActivityLoading) setErrorTokenActivityRetryLoading(false);
  }, [tokenActivityLoading]);

  const renderListLoading = tokenActivityLoading && !!tokenActivity.length;

  const handleRetry = () => {
    setErrorTokenActivityRetryLoading(true);
    retryTokenActivity();
  };

  const activityLoading = (!dataLoaded && tokenActivityLoading) || !timeFinish || errorTokenActivityRetryLoading;
  const miningPendingTxLoading = (!dataLoaded && txsLoading) || !timeFinish;

  return (
    <>
      <StyledSkeleton
        quantity={2}
        isLoading={miningPendingTxLoading}
      >
        {!!txs.length && (
          <>
            <Subtitle text="main.token.activity.miningPendingTxs" />
            <StyleFlatList
              refreshControl={refreshControl}
              data={timeFinish ? txs : []}
              keyExtractor={(item, index) => `MINING_PENDING_${(item as WalletTx).hash}${index}`}
              renderItem={({ item, index }) => (
                <TokenActivityItem activityItem={item as WalletTx} firstItem={!index} />
              )}
            />
          </>
        )}
      </StyledSkeleton>
      <Skeleton
        quantity={15}
        isLoading={activityLoading}
      >
        {!!txs.length && <Subtitle text="main.token.activity.title" />}
        <FlatList
          refreshControl={refreshControl}
          data={timeFinish ? tokenActivity : []}
          renderItem={({ item, index }) => <TokenActivityItem activityItem={item} firstItem={!index} />}
          keyExtractor={(item, index) => `ACTIVITY_${item.hash}${index}`}
          onEndReached={next}
          ListEmptyComponent={(
            <ErrorWrapper
              requiredValuesToRender={[null]}
              title="main.token.activity.emptyTitle"
              message={token ? 'common.tryRefresh' : ''}
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
    </>
  );
};

export default TokenActivity;
