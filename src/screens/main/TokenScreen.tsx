import React, { useMemo, useState } from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BigNumber } from 'ethers';
import styled from 'styled-components/native';

import Button, { ButtonType } from '@components/Button';
import Receive from '@components/Receive';
import ScreenLayout from '@components/ScreenLayout';
import Skeleton from '@components/Skeleton';
import Text from '@components/Text';
import TradingViewChart from '@components/TradingViewChart';
import BottomSheet from '@containers/Bottomsheet';
import useBalances from '@hooks/useBalances';
import useNotifications, { NotificationTypes } from '@hooks/useNotifications';
import usePull2Refresh from '@hooks/usePull2Refresh';
import useTokenConversions from '@hooks/useTokenConversions';
import useWalletPublicValues from '@hooks/useWalletPublicValues';
import { ScreenName } from '@navigation/constants';
import { MainNavigatorType } from '@navigation/MainNavigator';
import { FiatCurrencies } from '@utils/constants';
import { numberToFiatBalance, numberToFormattedString } from '@utils/formatter';
import { TOKENS_ETH } from '@web3/tokens';

const TOKENS = TOKENS_ETH;

const BalanceSkeleton = styled(Skeleton)`
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const Balance = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[20]};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const FiatBalanceSkeleton = styled(Skeleton)`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const FiatBalance = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[18]};
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const ButtonsWrapper = styled.View`
  flex-direction: row;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const ActionButton = styled(Button) <{ margin?: boolean }>`
  flex: 1;
  ${({ margin, theme }) => (margin ? `margin-right: ${theme.spacing(2)};` : '')}
`;

type TokenScreenProps = NativeStackScreenProps<MainNavigatorType, ScreenName.token>;

const TokenScreen = ({ navigation, route }: TokenScreenProps) => {
  const tokenSymbol = route.params?.tokenSymbol || '';

  const [receiveBottomSheet, setReceiveBottomSheet] = useState(false);

  const { dispatchNotification } = useNotifications();

  const { walletPublicValues } = useWalletPublicValues();

  const {
    tokenBalances,
    refetchBalances,
    tokenBalancesLoading,
  } = useBalances();


  const {
    convert,
    tokenConversions,
    tokenConversionsLoading,
    refetchTokenConversions,
  } = useTokenConversions();

  const token = useMemo(() => (
    tokenSymbol ? TOKENS[tokenSymbol] : null
  ), [tokenSymbol]);

  const tokenBalance = useMemo(() => {
    const zero = BigNumber.from(0);
    if (!token) return zero;

    return tokenBalances?.[token.symbol] || zero;
  }, [tokenSymbol]);

  const tokenBalanceConverted = useMemo(() => {
    const zero = BigNumber.from(0);

    if (!token) return zero;

    return convert(tokenBalance, token);
  }, [tokenBalance, tokenConversions]);

  const refetch = () => {
    refetchBalances();
    refetchTokenConversions();
  };

  const refreshControl = usePull2Refresh({
    loading: tokenBalancesLoading || tokenConversionsLoading,
    fetch: refetch,
  });

  const onPressSend = () => {
    if (!token) return;

    navigation.navigate(ScreenName.send, {
      tokenToSendSymbol: token.symbol,
    });
  };

  const toggleReceiveBottomSheet = (show: boolean) => setReceiveBottomSheet(show);

  const onPressAdress = () => {
    Clipboard.setString(walletPublicValues!.address);
    dispatchNotification('notifications.addressCopied', NotificationTypes.SUCCESS);
  };

  return (
    <>
      <ScreenLayout
        title={token?.name || ''}
        bigTitle
        scroll
        refreshControl={refreshControl}
      >
        <ButtonsWrapper>
          {!tokenBalance.isZero() && (
            <ActionButton
              margin
              icon="arrow-top-right"
              type={ButtonType.SECONDARY}
              text="common.send"
              onPress={onPressSend}
            />
          )}
          <ActionButton
            icon="arrow-bottom-left"
            type={ButtonType.SECONDARY}
            text="common.receive"
            onPress={() => toggleReceiveBottomSheet(true)}
          />
        </ButtonsWrapper>
        <BalanceSkeleton
          isLoading={!tokenBalances}
          height={30}
        >
          <Balance text={`${numberToFormattedString(tokenBalance, {
            decimals: token?.decimals,
          })} ${token?.symbol}`} />
        </BalanceSkeleton>
        <FiatBalanceSkeleton
          isLoading={!tokenConversions}
          height={25}
        >
          <FiatBalance text={numberToFiatBalance(tokenBalanceConverted, FiatCurrencies.USD)} />
        </FiatBalanceSkeleton>
        <>
          {!!token && (
            <TradingViewChart
              token={token}
            />
          )}
        </>
      </ScreenLayout>
      <BottomSheet
        visible={receiveBottomSheet}
        onClose={() => toggleReceiveBottomSheet(false)}
      >
        <Receive onPressAddress={onPressAdress} />
      </BottomSheet>
    </>
  );
};

export default TokenScreen;