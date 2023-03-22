import React from 'react';

import type { BigNumber } from 'ethers';
import styled from 'styled-components/native';

import Icon from './Icon';
import Skeleton from './Skeleton';
import Text from './Text';
import TokenIcon, { TokenIconProps } from './TokenIcon';
import useTokenConversions from '@hooks/useTokenConversions';
import {
  numberToFormattedString,
  numberToFiatBalance,
} from '@utils/formatter';
import { TokenType } from '@web3/tokens';

type TokenItemProps = Omit<TokenType, 'address'> & {
  balance?: BigNumber;
  balanceLoading?: boolean;
  withoutMargin?: boolean;
  fullName?: boolean;
  withBorders?: boolean;
  borderColor?: string;
  rightIcon?: string;
  rightIconColor?: string;
  status?: TokenIconProps['status'];
  disabled?: boolean;
  onPress?: () => void;
};

const WrapperItem = styled.TouchableOpacity<{
  withoutMargin?: boolean;
  withBorders?: boolean;
  borderColor?: string;
  disabledStyle?: boolean;
}>`
  opacity: ${({ disabledStyle }) => (disabledStyle
    ? 0.5 : 1)};
  padding: ${({ theme }) => theme.spacing(2)};
  flex-direction: row;
  ${({ withoutMargin, theme }) => (withoutMargin
    ? ''
    : `margin-top: ${theme.spacing(2)};`
  )}
  ${({ borderColor, withBorders, theme }) => (withBorders ? `
    border: 1px solid ${borderColor || theme.colors.border};
    border-radius: ${theme.borderRadius};
    ` : ''
  )}
`;


const DataColumn = styled.View`
  flex: 1;
  margin-left: ${({ theme }) => theme.spacing(2)}
`;

const Title = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[16]};
`;

const Description = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[12]};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const StyledTokenIcon = styled(TokenIcon)`
  align-self: center;
`;

const StyledSkeleton = styled(Skeleton)`
  margin-top: ${({ theme }) => theme.spacing(1)}
`;

const RightIcon = styled(Icon)<{ color?: string }>`
  color: ${({ color, theme }) => (color || theme.colors.text.primary)};
`;

const TokenItem = ({
  symbol,
  decimals,
  balance,
  name,
  borderColor,
  onPress,
  status,
  rightIcon = '',
  rightIconColor = '',
  disabled = false,
  balanceLoading = false,
  withoutMargin = false,
  fullName = false,
  withBorders = false,
}: TokenItemProps) => {
  const {
    convert,
    tokenConversions,
  } = useTokenConversions({
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const balanceFormatted = numberToFormattedString(balance || 0, { decimals });
  const balanceConverted = numberToFiatBalance(convert(balance || 0, { symbol, decimals }), 'USD');

  const dataColumn = fullName ? (
    <>
      <Title text={name} noI18n />
      <Skeleton
        isLoading={balanceLoading}
        height={15}
      >
        <Description text={`${balanceFormatted} ${symbol}`} noI18n />
      </Skeleton>
      <StyledSkeleton
        isLoading={balanceLoading || !tokenConversions}
        height={15}
        width="80%"
      >
        <Description text={balanceConverted} noI18n />
      </StyledSkeleton>
    </>
  ) : (
    <>
      <Skeleton
        isLoading={balanceLoading}
        height={15}
      >
        <Title text={`${balanceFormatted} ${symbol}`} noI18n />
      </Skeleton>
      <StyledSkeleton
        isLoading={!tokenConversions}
        width="80%"
        height={15}
      >
        <Description text={balanceConverted} noI18n />
      </StyledSkeleton>
    </>
  );

  return (
    <WrapperItem
      withoutMargin={withoutMargin}
      withBorders={withBorders}
      borderColor={borderColor}
      onPress={onPress}
      disabledStyle={disabled}
      disabled={disabled || !onPress}
    >
      <StyledTokenIcon
        tokenSymbol={symbol}
        size={fullName ? 44 : 36}
        status={status}
      />
      <DataColumn>
        {dataColumn}
      </DataColumn>
      {!!rightIcon && <RightIcon name={rightIcon} color={rightIconColor} />}
    </WrapperItem>
  );
};

export default TokenItem;
