import React, { useMemo, useState } from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import styled from 'styled-components/native';

import Button from '@components/Button';
import ErrorWrapper from '@components/ErrorWrapper';
import HomeHeader from '@components/HomeHeader';
import Pill from '@components/Pill';
import Receive from '@components/Receive';
import ScreenLayout from '@components/ScreenLayout';
import Skeleton from '@components/Skeleton';
import Text from '@components/Text';
import Title from '@components/Title';
import TokenBalances from '@components/TokenBalances';
import TokenPrices from '@components/TokenPrices';
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
  ${({ margin, theme }) => (margin ? `margin-right: ${theme.spacing(2)};` : '')}
`;

type HomeScreenProps = NativeStackScreenProps<MainNavigatorType, ScreenName.home>;

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [receiveBottomSheet, setReceiveBottomSheet] = useState(false);

  const { dispatchNotification } = useNotifications();


  const { address } = useWalletPublicValues();
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
    refetchBalances();
    refetchTokenConversions();
  };

  const refreshControl = usePull2Refresh({
    loading: tokenBalancesLoading || tokenConversionsLoading,
    fetch: refetch,
  });

  const tokens = useMemo(() => Object.values(tokensObj), [tokensObj]);

  const totalConvertedBalance = useMemo(() => {
    if (!tokenBalances) return `0 ${consolidatedCurrency}`;

    const total = tokens.reduce((
      acc: number,
      { symbol, decimals }: TokenType,
    ) => {
      const currentBalance = convert(tokenBalances[symbol], { symbol, decimals });
      return acc + currentBalance;
    }, 0);

    return numberToFiatBalance(total, consolidatedCurrency);
  }, [consolidatedCurrency, tokenBalances, tokenConversions]);

  const onPressAdress = () => {
    if (!address) return;

    Clipboard.setString(address);
    dispatchNotification('notifications.addressCopied');
  };

  const onPressSend = () => navigation.navigate(ScreenName.send);
  const onPressToken = (token: TokenType) => navigation.navigate(ScreenName.token, {
    tokenSymbol: token.symbol,
  });

  const toggleReceiveBottomSheet = (show: boolean) => setReceiveBottomSheet(show);

  return (
    <>
      <ScreenLayout
        hasBack={false}
        keyboardAvoidingView
        scroll
        refreshControl={refreshControl}
        footerHeight={70}
        footer={<TokenPrices />}
      >
        <HomeHeader />
        <ButtonsWrapper>
          <ActionButton
            margin
            icon="arrow-top-right"
            text="common.send"
            onPress={onPressSend}
          />
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

export default HomeScreen;
