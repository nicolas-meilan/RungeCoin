import React from 'react';
import { FlatListProps } from 'react-native';

import styled from 'styled-components/native';

import TradingViewChart from './TradingViewChart';
import type { TokenType } from '@web3/tokens';

const StyledScrollView = styled.ScrollView`
  flex: 1;
`;

type TokenPriceProps = {
  token?: TokenType | null;
  refreshControl: FlatListProps<any>['refreshControl'];
};

const TokenPrice = ({
  token,
  refreshControl,
}: TokenPriceProps) => (
  <StyledScrollView refreshControl={refreshControl}>
    <TradingViewChart token={token} />
  </StyledScrollView>
);

export default TokenPrice;
