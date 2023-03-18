import React from 'react';
import { ScrollView } from 'react-native';

import { debounce } from 'lodash';
import styled from 'styled-components/native';

import Skeleton from './Skeleton';
import TokenItem from './TokenItem';
import useBalances from '@hooks/useBalances';
import usePull2Refresh from '@hooks/usePull2Refresh';
import {
  TOKENS_ETH,
  TokenType,
} from '@web3/tokens';

const TOKENS = Object.values(TOKENS_ETH);

type TokenBalancesProps = {
  onPressToken: (token: TokenType) => void;
  onRefresh?: () => void;
  refreshLoading?: boolean;
};

const StyledSkeleton = styled(Skeleton)`
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const TokenBalances = ({
  onPressToken,
  onRefresh,
  refreshLoading = false,
}: TokenBalancesProps) => {
  const {
    tokenBalances,
    refetchBalances,
    tokenBalancesLoading,
  } = useBalances({
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const refetch = () => {
    refetchBalances();
    onRefresh?.();
  };

  const refreshControl = usePull2Refresh({
    loading: tokenBalancesLoading || refreshLoading,
    fetch: refetch,
  });

  return (
    <StyledSkeleton
      isLoading={!tokenBalances}
      quantity={TOKENS.length}
      height={35}
    >
      <ScrollView
        refreshControl={refreshControl}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {tokenBalances && TOKENS.map((token: TokenType, index: number) => (
          <TokenItem
            key={`BALANCE_${token.name}`}
            withoutMargin={!index}
            balance={tokenBalances[token.symbol]}
            rightIcon="chevron-right"
            onPress={debounce(() => onPressToken(token))}
            {...token}
          />
        ))}
      </ScrollView>
    </StyledSkeleton>
  );
};

export default TokenBalances;
