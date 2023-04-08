import React, { useMemo, useState } from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BigNumber } from 'ethers';
import styled from 'styled-components/native';

import Button from '@components/Button';
import ContentSwitcher from '@components/ContentSwitcher';
import ErrorWrapper from '@components/ErrorWrapper';
import Receive from '@components/Receive';
import ScreenLayout from '@components/ScreenLayout';
import Skeleton from '@components/Skeleton';
import Text from '@components/Text';
import TokenActivity from '@components/TokenActivity';
import TokenIcon from '@components/TokenIcon';
import TradingViewChart from '@components/TradingViewChart';
import BottomSheet from '@containers/Bottomsheet';
import useBalances from '@hooks/useBalances';
import useBlockchainData from '@hooks/useBlockchainData';
import useNotifications from '@hooks/useNotifications';
import usePull2Refresh from '@hooks/usePull2Refresh';
import useTokenConversions from '@hooks/useTokenConversions';
import useWalletActivity from '@hooks/useWalletActivity';
import useWalletPublicValues from '@hooks/useWalletPublicValues';
import { ScreenName } from '@navigation/constants';
import { MainNavigatorType } from '@navigation/MainNavigator';
import { FiatCurrencies } from '@utils/constants';
import { numberToFiatBalance, numberToFormattedString } from '@utils/formatter';

const TokenInfo = styled.View`
  flex-direction: row;
  align-items: center;
  margin-vertical: ${({ theme }) => theme.spacing(4)};
`;

const BalanceWrapper = styled.View`
  flex: 1;
  margin-left: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
`;

const BalanceSkeleton = styled(Skeleton)`
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const Balance = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[18]};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const FiatBalanceSkeleton = styled(Skeleton)`
`;

const FiatBalance = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[16]};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ButtonsWrapper = styled.View`
  flex-direction: row;
`;

const StyledScrollView = styled.ScrollView`
  flex: 1;
`;

const ActionButton = styled(Button) <{ margin?: boolean }>`
  flex: 1;
  ${({ margin, theme }) => (margin ? `margin-right: ${theme.spacing(2)};` : '')}
`;

type TokenScreenProps = NativeStackScreenProps<MainNavigatorType, ScreenName.token>;

const TokenScreen = ({ navigation, route }: TokenScreenProps) => {
  const tokenSymbol = route.params?.tokenSymbol || '';

  const [receiveBottomSheet, setReceiveBottomSheet] = useState(false);
  const [isOnActivity, setIsOnActivity] = useState(false);

  const { dispatchNotification } = useNotifications();

  const { walletPublicValues } = useWalletPublicValues();
  const { tokens } = useBlockchainData();

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
    tokenSymbol ? tokens[tokenSymbol] : null
  ), [tokenSymbol]);

  const {
    refetchTokenActivity,
    tokenActivityLoading,
  } = useWalletActivity({
    tokenAddress: token?.address || '',
  });

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
    if (isOnActivity) refetchTokenActivity();
  };

  const refreshControl = usePull2Refresh({
    loading: tokenBalancesLoading || tokenConversionsLoading || tokenActivityLoading,
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
    dispatchNotification('notifications.addressCopied');
  };
  const onTabChange = () => setIsOnActivity(!isOnActivity);

  return (
    <>
      <ScreenLayout
        title={token?.name || ''}
        bigTitle
      >
        <ButtonsWrapper>
          {!tokenBalance.isZero() && (
            <ActionButton
              margin
              icon="arrow-top-right"
              text="common.send"
              onPress={onPressSend}
            />
          )}
          <ActionButton
            icon="arrow-bottom-left"
            text="common.receive"
            onPress={() => toggleReceiveBottomSheet(true)}
          />
        </ButtonsWrapper>
        <TokenInfo>
          <ErrorWrapper requiredValuesToRender={[token]}>
            {token && <TokenIcon tokenSymbol={token.symbol} size={44} />}
            <BalanceWrapper>
              <BalanceSkeleton
                isLoading={!tokenBalances}
                height={30}
              >
                <Balance text={`${numberToFormattedString(tokenBalance, {
                  decimals: token?.decimals,
                })} ${token?.symbol}`} />
              </BalanceSkeleton>
              <FiatBalanceSkeleton
                isLoading={!tokenBalances || !tokenConversions}
                height={25}
              >
                <FiatBalance text={numberToFiatBalance(tokenBalanceConverted, FiatCurrencies.USD)} />
              </FiatBalanceSkeleton>
            </BalanceWrapper>
          </ErrorWrapper>
        </TokenInfo>
        <ContentSwitcher
          labels={['main.token.info', 'main.token.activity.title']}
          onChange={onTabChange}
          components={[
            (
              <StyledScrollView refreshControl={refreshControl}>
                <TradingViewChart token={token} />
              </StyledScrollView>
            ),
            (
              <TokenActivity
                token={token}
                refreshControl={refreshControl}
                retry={refetchTokenActivity}
              />
            ),
          ]}
        />
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