import React, { useEffect, useState } from 'react';
import { FlatList, FlatListProps } from 'react-native';

import styled, { useTheme } from 'styled-components/native';

import Skeleton from './Skeleton';
import TokenActivityItem from './TokenActivityItem';
import useWalletActivity from '@hooks/useWalletActivity';
import type { TokenType } from '@web3/tokens';

type TokenActivityProps = {
  token?: TokenType | null;
  refreshControl?: FlatListProps<any>['refreshControl'];
};

const ListLoading = styled.ActivityIndicator`
  margin: ${({ theme }) => theme.spacing(4)};
`;

const TokenActivity = ({
  token,
  refreshControl,
}: TokenActivityProps) => {
  const theme = useTheme();
  const [dataLoaded, setDataLoaded] = useState(false);

  const {
    refetchTokenActivity,
    tokenActivity,
    next,
    tokenActivityLoading,
  } = useWalletActivity({
    tokenAddress: token?.address || '',
  });

  useEffect(() => {
    if (!tokenActivity) {
      refetchTokenActivity();
      return;
    }
    setDataLoaded(true);
  }, []);

  const renderListLoading = tokenActivityLoading && !!tokenActivity.length;

  return (
    <Skeleton
      quantity={15}
      isLoading={!dataLoaded && tokenActivityLoading}
    >
      <FlatList
        refreshControl={refreshControl}
        data={tokenActivity}
        renderItem={({ item }) => <TokenActivityItem activityItem={item} />}
        keyExtractor={(item) => item.hash}
        onEndReached={next}
        {...(renderListLoading
          ? { ListFooterComponent: <ListLoading color={theme.colors.info} size={32} /> }
          : null
        )}
      />
    </Skeleton>
  );
};

export default TokenActivity;
