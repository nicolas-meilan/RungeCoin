import React, { useMemo } from 'react';
import { ScrollView } from 'react-native';

import styled from 'styled-components/native';

import ErrorWrapper from './ErrorWrapper';
import Skeleton from './Skeleton';
import TokenItem from './TokenItem';
import useBalances from '@hooks/useBalances';
import useBlockchainData from '@hooks/useBlockchainData';
import type { TokenType } from '@web3/tokens';

type TokenBalancesProps = {
  onPressToken: (token: TokenType) => void;
  retryError?: () => void;
  refreshLoading?: boolean;
};

const StyledSkeleton = styled(Skeleton)`
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const TokenBalances = ({
  onPressToken,
  retryError,
}: TokenBalancesProps) => {
  const { tokens: tokensObj } = useBlockchainData();

  const {
    tokenBalances,
    tokenBalancesLoading,
  } = useBalances({
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const tokens = useMemo(() => Object.values(tokensObj), [tokensObj]);

  return (
    <ErrorWrapper
      requiredValuesToRender={[tokenBalances]}
      isLoading={tokenBalancesLoading}
      height={350}
      retryCallback={retryError}
    >
      <StyledSkeleton
        isLoading={!tokenBalances}
        quantity={tokens.length}
        height={35}
        withScroll
      >
        <ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          {tokenBalances && tokens.map((token: TokenType, index: number) => (
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
    </ErrorWrapper>
  );
};

export default TokenBalances;
