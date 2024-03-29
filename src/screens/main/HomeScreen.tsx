import React, { useEffect, useMemo, useState } from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import styled, { useTheme } from 'styled-components/native';

import BlockchainExtraData from '@components/BlockchainExtraData';
import Button from '@components/Button';
import DoublePrivateKeyEncryptionMessage from '@components/DoublePrivateKeyEncryptionMessage';
import ErrorWrapper from '@components/ErrorWrapper';
import HomeHeader from '@components/HomeHeader';
import HwWalletConnector from '@components/HwWalletConnector';
import Pill from '@components/Pill';
import Receive from '@components/Receive';
import ScreenLayout from '@components/ScreenLayout';
import Skeleton from '@components/Skeleton';
import { Spacer } from '@components/Spacer';
import Text from '@components/Text';
import Title from '@components/Title';
import TokenBalances from '@components/TokenBalances';
import TokenPrices from '@components/TokenPrices';
import WalletWithoutAddress from '@components/WalletWithoutAddress';
import BottomSheet from '@containers/Bottomsheet';
import useBalances from '@hooks/useBalances';
import useBlockchainData from '@hooks/useBlockchainData';
import useConsolidatedCurrency from '@hooks/useConsolidatedCurrency';
import useNotifications from '@hooks/useNotifications';
import usePull2Refresh from '@hooks/usePull2Refresh';
import useTokenConversions from '@hooks/useTokenConversions';
import useWalletPublicValues from '@hooks/useWalletPublicValues';
import { ScreenName } from '@navigation/constants';
import { MainNavigatorType } from '@navigation/MainNavigator';
import { formatAddress, numberToFiatBalance } from '@utils/formatter';
import type { TokenType } from '@web3/tokens';

const Balance = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[28]};
  margin: ${({ theme }) => theme.spacing(2)} 0 ${({ theme }) => theme.spacing(4)} 0;
`;

const CenterWrapper = styled.View`
  align-items: center;
  margin-vertical: ${({ theme }) => theme.spacing(4)};
`;

const ButtonsWrapper = styled.View`
  flex-direction: row;
`;

const BalanceSkeleton = styled(Skeleton)`
  margin: ${({ theme }) => theme.spacing(2)} 0 ${({ theme }) => theme.spacing(4)} 0;
`;

const ActionButton = styled(Button) <{ margin?: boolean }>`
  flex: 1;
`;

const FullAnimatedView = styled(Animated.View)`
  flex: 1;
`;

type HomeScreenProps = NativeStackScreenProps<MainNavigatorType, ScreenName.home>;

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const theme = useTheme();
  const [receiveBottomSheet, setReceiveBottomSheet] = useState(false);
  const [addressUpdated, setAddressUpdated] = useState(false);

  const { dispatchNotification } = useNotifications();


  const { address, walletPublicValues } = useWalletPublicValues();
  const {
    tokens: tokensObj,
  } = useBlockchainData();

  const {
    convert,
    tokenConversions,
    tokenConversionsLoading,
    refetchTokenConversions,
  } = useTokenConversions();

  const { consolidatedCurrency } = useConsolidatedCurrency();

  const {
    tokenBalances,
    refetchBalances,
    tokenBalancesLoading,
  } = useBalances();

  const refetch = () => {
    if (!address) return;

    refetchBalances();
    refetchTokenConversions();
  };

  const refreshControl = usePull2Refresh({
    loading: tokenBalancesLoading || tokenConversionsLoading,
    fetch: refetch,
  });

  useEffect(() => {
    if (addressUpdated && address) {
      refetch();
      setAddressUpdated(false);
    }
  }, [address, addressUpdated]);

  const tokens = useMemo(() => Object.values(tokensObj), [tokensObj]);

  const totalConvertedBalance = useMemo(() => {
    if (!address || !tokenBalances) return `0 ${consolidatedCurrency}`;

    const total = tokens.reduce((
      acc: number,
      { symbol, decimals }: TokenType,
    ) => {
      const currentBalance = convert(tokenBalances[symbol], { symbol, decimals });
      return acc + currentBalance;
    }, 0);

    return numberToFiatBalance(total, consolidatedCurrency);
  }, [address, consolidatedCurrency, tokenBalances, tokenConversions]);

  const onPressAdress = () => {
    if (!address) return;

    Clipboard.setString(address);
    dispatchNotification('notifications.addressCopied');
  };

  const onPressSend = () => navigation.navigate(ScreenName.send);
  const onPressToken = (token: TokenType) => navigation.navigate(ScreenName.token, {
    tokenSymbol: token.symbol,
  });

  const onFinishHwConnection = () => setAddressUpdated(true);
  const toggleReceiveBottomSheet = (show: boolean) => setReceiveBottomSheet(show);

  const contentStyle = address ? undefined : { flex: 1 };
  const availableRefreshControl = address ? refreshControl : undefined;

  const noAddressComponent = walletPublicValues?.isHw
    ? <HwWalletConnector onConnectionSuccess={onFinishHwConnection} />
    : <WalletWithoutAddress />;

  return (
    <>
      <ScreenLayout
        hasBack={false}
        scroll
        keyboardAvoidingView
        refreshControl={availableRefreshControl}
        footerHeight={70}
        contentContainerStyle={contentStyle}
        footer={<TokenPrices />}
      >
        <HomeHeader />
        {address
          ? (
            <Animated.View
              key="MAIN_HOME"
              entering={FadeIn}
              exiting={FadeOut}
            >
              <BlockchainExtraData />
              <ButtonsWrapper>
                <ActionButton
                  icon="arrow-top-right"
                  text="common.send"
                  onPress={onPressSend}
                />
                <Spacer size={theme.spacingNative(2)} horizontal />
                <ActionButton
                  icon="arrow-bottom-left"
                  text="common.receive"
                  onPress={() => toggleReceiveBottomSheet(true)}
                />
              </ButtonsWrapper>
              <CenterWrapper>
                <Title title="main.home.balance" isSubtitle />
                <ErrorWrapper
                  requiredValuesToRender={[tokenBalances, tokenConversions]}
                  isLoading={tokenBalancesLoading || tokenConversionsLoading}
                  errorComponent={<Balance text={totalConvertedBalance} />}
                >
                  <BalanceSkeleton
                    isLoading={!tokenBalances || !tokenConversions}
                    width={200}
                    height={30}
                  >
                    <Balance text={totalConvertedBalance} />
                  </BalanceSkeleton>
                </ErrorWrapper>
                <Pill
                  text={formatAddress(address!)}
                  type="info"
                  onPress={onPressAdress}
                  noI18n
                />
              </CenterWrapper>
              <TokenBalances
                onPressToken={onPressToken}
                retryError={refetch}
                refreshLoading={tokenConversionsLoading}
              />
            </Animated.View>
          ) : (
            <FullAnimatedView
              key="NO_ADDRESS_HOME"
              entering={FadeIn}
              exiting={FadeOut}
            >
              {noAddressComponent}
            </FullAnimatedView>
          )}
      </ScreenLayout>
      <BottomSheet
        visible={receiveBottomSheet}
        onClose={() => toggleReceiveBottomSheet(false)}
      >
        <Receive onPressAddress={onPressAdress} />
      </BottomSheet>
      <DoublePrivateKeyEncryptionMessage />
    </>
  );
};

export default HomeScreen;
