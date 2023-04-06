import React, { useMemo } from 'react';
import { View } from 'react-native';

import { NavigationProp, useNavigation } from '@react-navigation/native';
import { BigNumber } from 'ethers';
import styled, { useTheme } from 'styled-components/native';

import Icon from './Icon';
import Skeleton from './Skeleton';
import Text from './Text';
import useBlockchainData from '@hooks/useBlockchainData';
import useTokenConversions from '@hooks/useTokenConversions';
import useWalletPublicValues from '@hooks/useWalletPublicValues';
import type { WalletTx } from '@http/tx';
import { ScreenName } from '@navigation/constants';
import type { MainNavigatorType } from '@navigation/MainNavigator';
import { FiatCurrencies } from '@utils/constants';
import { numberToFiatBalance, numberToFormattedString } from '@utils/formatter';
import { formatDate } from '@utils/time';
import { isSendTx, txStatus } from '@utils/tx';

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

const BalanceData = styled.View`
  maxWidth: 60%;
`;

const Description = styled(Text) <{ alignRight?: boolean }>`
  font-size: ${({ theme }) => theme.fonts.size[12]};
  color: ${({ theme }) => theme.colors.text.secondary};
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
  const navigation = useNavigation<NavigationProp<MainNavigatorType>>();

  const {
    tokens: tokensObj,
    blockchainBaseToken,
  } = useBlockchainData();
  const { walletPublicValues } = useWalletPublicValues();

  const {
    convert,
    tokenConversions,
  } = useTokenConversions({
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const tokens = useMemo(() => Object.values(tokensObj), [tokensObj]);

  const token = activityItem.contractAddress
    ? Object.values(tokens).find((item) => (
      item.address.toUpperCase() === activityItem.contractAddress.toUpperCase()
    ))
    : blockchainBaseToken;

  const balance = BigNumber.from(activityItem.value);
  const isSending = isSendTx(activityItem, walletPublicValues?.address);
  const txIcon = isSending ? 'arrow-top-right' : 'arrow-bottom-left';
  const txIconColor = isSending ? theme.colors.error : theme.colors.success;

  const status = txStatus(activityItem);

  if (!token) return null;

  const balanceFormatted = numberToFormattedString(balance, { decimals: token.decimals });
  const balanceConverted = numberToFiatBalance(convert(balance, token), FiatCurrencies.USD);

  const goToTx = () => navigation.navigate(ScreenName.tx, { token, tx: activityItem });

  return (
    <WrapperItem firstItem={!firstItem}>
      <Touchable onPress={goToTx}>
        <TxIcon name={txIcon} color={txIconColor} />
        <Data>
          <BalanceData>
            <Text
              text={`${balanceFormatted} ${token.symbol}`}
              noI18n
              numberOfLines={1}
            />
            <StyledSkeleton
              isLoading={!tokenConversions}
              width="80%"
              height={15}
            >
              <Description
                text={balanceConverted}
                noI18n
                numberOfLines={1}
              />
            </StyledSkeleton>
          </BalanceData>
          <View>
            <StatusText
              text={`main.token.activity.tx.status.${status}`}
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
