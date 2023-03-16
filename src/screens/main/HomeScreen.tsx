import React, { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';

import Clipboard from '@react-native-clipboard/clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import styled from 'styled-components/native';

import Button, { ButtonType } from '@components/Button';
import Pill, { Type } from '@components/Pill';
import Receive from '@components/Receive';
import ScreenLayout from '@components/ScreenLayout';
import Separator from '@components/Separator';
import Skeleton from '@components/Skeleton';
import Text from '@components/Text';
import Title from '@components/Title';
import TokenItem from '@components/TokenItem';
import TokenPrices from '@components/TokenPrices';
import BottomSheet from '@containers/Bottomsheet';
import useBalances from '@hooks/useBalances';
import useNotifications, { NotificationTypes } from '@hooks/useNotifications';
import usePull2Refresh from '@hooks/usePull2Refresh';
import useTokenConversions from '@hooks/useTokenConversions';
import useWalletPublicValues from '@hooks/useWalletPublicValues';
import { ScreenName } from '@navigation/constants';
import { MainNavigatorType } from '@navigation/MainNavigator';
import { formatAddress, numberToFiatBalance } from '@utils/formatter';
import {
  TOKENS_ETH,
  TokenType,
} from '@web3/tokens';

const TOKENS = Object.values(TOKENS_ETH);

const Balance = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[28]};
  text-align: center;
  margin: ${({ theme }) => theme.spacing(2)} 0 ${({ theme }) => theme.spacing(4)} 0;
`;

const Subtitle = styled(Title)`
  text-align: center;
`;

const CenterWrapper = styled.View`
  align-items: center;
  margin: ${({ theme }) => theme.spacing(4)};
`;

const ButtonsWrapper = styled.View`
  flex-direction: row;
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const AdressPill = styled(Pill)`
  font-size: ${({ theme }) => theme.fonts.size[16]};
`;

const BalanceSkeleton = styled(Skeleton)`
  margin: ${({ theme }) => theme.spacing(4)} 0 ${({ theme }) => theme.spacing(4)} 0;
`;

const ActionButton = styled(Button) <{ margin?: boolean }>`
  flex: 1;
  ${({ margin, theme }) => (margin ? `margin-right: ${theme.spacing(2)};` : '')}
`;

type HomeScreenProps = NativeStackScreenProps<MainNavigatorType, ScreenName.home>;

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [receiveBottomSheet, setReceiveBottomSheet] = useState(false);

  const { tokenBalances, refetchBalances, tokenBalancesLoading } = useBalances();
  const { walletPublicValues } = useWalletPublicValues();
  const { dispatchNotification } = useNotifications();
  const {
    convert,
    tokenConversions,
  } = useTokenConversions();

  const refreshControl = usePull2Refresh({
    loading: tokenBalancesLoading,
    fetch: refetchBalances,
  });

  const totalConvertedBalance = useMemo(() => {
    if (!tokenBalances) return '0 USD';

    const total = TOKENS.reduce((
      acc: number,
      { symbol, decimals }: TokenType,
    ) => {
      const currentBalance = convert(tokenBalances[symbol], { symbol, decimals });
      return acc + currentBalance;
    }, 0);

    return numberToFiatBalance(total, 'USD');
  }, [tokenBalances, tokenConversions]);

  const onPressAdress = () => {
    Clipboard.setString(walletPublicValues!.address);
    dispatchNotification('notifications.addressCopied', NotificationTypes.SUCCESS);
  };

  const onPressSend = () => navigation.navigate(ScreenName.send);

  const onPressToken = (token: TokenType) => navigation.navigate(ScreenName.token, {
    tokenSymbol: token.symbol,
  });

  const toggleReceiveBottomSheet = (show: boolean) => setReceiveBottomSheet(show);

  return (
    <>
      <ScreenLayout
        title="main.home.title"
        bigTitle
        hasBack={false}
        keyboardAvoidingView
        footerHeight={70}
        footer={<TokenPrices />}
      >
        <ButtonsWrapper>
          <ActionButton
            margin
            icon="arrow-top-right"
            type={ButtonType.SECONDARY}
            text="common.send"
            onPress={onPressSend}
          />
          <ActionButton
            icon="arrow-bottom-left"
            type={ButtonType.SECONDARY}
            text="common.receive"
            onPress={() => toggleReceiveBottomSheet(true)}
          />
        </ButtonsWrapper>
        <CenterWrapper>
          <Subtitle title="main.home.balance" isSubtitle />
          <BalanceSkeleton
            isLoading={!tokenBalances || !tokenConversions}
            width={200}
            height={30}
          >
            <Balance text={totalConvertedBalance} />
          </BalanceSkeleton>
          <AdressPill
            text={formatAddress(walletPublicValues!.address)}
            type={Type.INFO}
            onPress={onPressAdress}
            noI18n
          />
        </CenterWrapper>
        <Separator />
        <Skeleton
          isLoading={!tokenBalances}
          quantity={TOKENS.length}
          height={40}
        >
          <ScrollView
            refreshControl={refreshControl}
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
        </Skeleton>
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
