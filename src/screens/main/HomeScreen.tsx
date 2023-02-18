import React, { useMemo } from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import styled from 'styled-components/native';

import Card from '@components/Card';
import Pill, { Type } from '@components/Pill';
import ScreenLayout from '@components/ScreenLayout';
import Skeleton from '@components/Skeleton';
import Text from '@components/Text';
import Title from '@components/Title';
import TokenItem from '@components/TokenItem';
import useBalances from '@hooks/useBalances';
import useTokenConversions from '@hooks/useTokenConversions';
import useWalletPublicValues from '@hooks/useWalletPublicValues';
import { formatAddress, numberToFiatBalance } from '@utils/formatter';
import {
  TOKENS_ETH,
  TokenType,
} from '@web3/tokens';

const TOKENS = Object.values(TOKENS_ETH);
const CARD_HEIGHT = 300;

const Balance = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[28]};
  text-align: center;
  margin: ${({ theme }) => theme.spacing(2)} 0 ${({ theme }) => theme.spacing(10)} 0;
`;

const BalancesCard = styled(Card)`
  height: ${CARD_HEIGHT}px;
`;

const Subtitle = styled(Title)`
  text-align: center;
`;

const CenterWrapper = styled.View`
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(10)};
`;

const AdressPill = styled(Pill)`
  font-size: ${({ theme }) => theme.fonts.size[16]};
`;

const BalanceSkeleton = styled(Skeleton)`
  margin: ${({ theme }) => theme.spacing(5)} 0 ${({ theme }) => theme.spacing(10)} 0;
`;

const HomeScreen = () => {
  const { tokenBalances } = useBalances();
  const { walletPublicValues } = useWalletPublicValues();
  const {
    convert,
    tokenConversions,
  } = useTokenConversions();

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
    Clipboard.setString(walletPublicValues!.address); // TODO add copied notification
  };

  return (
    <ScreenLayout
      title='main.home.title'
      bigTitle
      hasBack={false}
    >
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
      <BalancesCard scroll>
        <Skeleton
          isLoading={!tokenBalances}
          quantity={TOKENS.length}
          height={40}
        >
          <>
            {tokenBalances && TOKENS.map((token: TokenType, index: number) => (
              <TokenItem
                key={`BALANCE_${token.name}`}
                withoutMargin={!index}
                balance={tokenBalances[token.symbol]}
                {...token}
              />
            ))}
          </>
        </Skeleton>
      </BalancesCard>
    </ScreenLayout>
  );
};

export default HomeScreen;
