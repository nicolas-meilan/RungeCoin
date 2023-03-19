import React from 'react';
import { ScrollView } from 'react-native';

import styled from 'styled-components/native';

import Skeleton from './Skeleton';
import TokenItem from './TokenItem';
import useBalances from '@hooks/useBalances';
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
}: TokenBalancesProps) => {
  const {
    tokenBalances,
  } = useBalances({
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  return (
    <StyledSkeleton
      isLoading={!tokenBalances}
      quantity={TOKENS.length}
      height={35}
    >
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {tokenBalances && TOKENS.map((token: TokenType, index: number) => (
          <TokenItem
            key={`BALANCE_${token.name}`}
            withoutMargin={!index}
            balance={tokenBalances[token.symbol]}
            rightIcon="chevron-right"
            onPress={() => onPressToken(token)}
            {...token}
          />
        ))}
      </ScrollView>
    </StyledSkeleton>
  );
};

export default TokenBalances;
