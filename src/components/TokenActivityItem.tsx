import React from 'react';
import { View } from 'react-native';

import { BigNumber } from 'ethers';
import styled, { useTheme } from 'styled-components/native';

import Icon from './Icon';
import Skeleton from './Skeleton';
import Text from './Text';
import useBalances from '@hooks/useBalances';
import useTokenConversions from '@hooks/useTokenConversions';
import useWalletPublicValues from '@hooks/useWalletPublicValues';
import type { WalletTx } from '@http/wallet';
import { numberToFiatBalance, numberToFormattedString } from '@utils/formatter';
import { formatDate } from '@utils/time';
import { isSendTx, txStatus } from '@utils/tx';
import { TOKENS_ETH } from '@web3/tokens';

const TOKENS = Object.values(TOKENS_ETH);

type TokenActivityItemProps = {
  activityItem: WalletTx;
  firstItem?: boolean;
};

const WrapperItem = styled.View<{
  firstItem?: boolean;
}>`
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(2)};
  flex-direction: row;
  ${({ firstItem, theme }) => (firstItem
    ? `
      border-top-width: 1px;
      border-top-color: ${theme.colors.background.secondary};
    `
    : ''
  )}
`;

const Touchable = styled.TouchableOpacity`
  flex: 1;
  flex-direction: row;
`;

const Data = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
`;

const Title = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[16]};
`;

const Description = styled(Text) <{ alignRight?: boolean }>`
  font-size: ${({ theme }) => theme.fonts.size[12]};
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-align: ${({ alignRight }) => (alignRight ? 'right' : 'left')};
`;

const StyledSkeleton = styled(Skeleton)`
  margin-top: ${({ theme }) => theme.spacing(1)}
`;

const TxIcon = styled(Icon) <{ color?: string }>`
  margin-right: ${({ theme }) => theme.spacing(2)};
  color: ${({ color, theme }) => (color || theme.colors.text.primary)};
`;

const StatusText = styled(Text) <{ color: string }>`
  font-size: ${({ theme }) => theme.fonts.size[16]};
  color: ${({ color }) => color};
  text-align: right;
`;

const TokenActivityItem = ({
  activityItem,
  firstItem,
}: TokenActivityItemProps) => {
  const theme = useTheme();
  const { walletPublicValues } = useWalletPublicValues();

  const {
    tokenBalancesLoading,
    tokenBalances,
  } = useBalances({
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const {
    convert,
    tokenConversions,
  } = useTokenConversions({
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const token = activityItem.contractAddress
    ? TOKENS.find((item) => (
      item.address.toUpperCase() === activityItem.contractAddress.toUpperCase()
    ))
    : TOKENS_ETH.ETH;

  const balance = BigNumber.from(activityItem.value);

  const isSending = isSendTx(activityItem, walletPublicValues?.address);
  const txIcon = isSending ? 'arrow-top-right' : 'arrow-bottom-left';
  const txIconColor = isSending ? theme.colors.error : theme.colors.success;

  const status = txStatus(activityItem);

  if (!token) return null;

  const balanceFormatted = numberToFormattedString(balance || 0, { decimals: token.decimals });
  const balanceConverted = numberToFiatBalance(convert(balance || 0, token), 'USD');

  return (
    <WrapperItem firstItem={!firstItem}>
      <Touchable onPress={() => { }}>
        <TxIcon name={txIcon} color={txIconColor} />
        <Data>
          <View>
            <Skeleton
              isLoading={!tokenBalances && tokenBalancesLoading}
              height={15}
            >
              <Title text={`${balanceFormatted} ${token.symbol}`} noI18n />
            </Skeleton>
            <StyledSkeleton
              isLoading={!tokenConversions}
              width="80%"
              height={15}
            >
              <Description text={balanceConverted} noI18n />
            </StyledSkeleton>
          </View>
          <View>
            <StatusText
              text={`main.token.activity.status.${status}`}
              color={theme.colors[status]}
            />
            <Description
              alignRight
              text={formatDate(activityItem.timeStamp)}
            />
          </View>
        </Data>
      </Touchable>
    </WrapperItem>
  );
};

export default TokenActivityItem;