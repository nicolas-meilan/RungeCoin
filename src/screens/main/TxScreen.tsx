import React, { useMemo } from 'react';
import { Linking } from 'react-native';

import Clipboard from '@react-native-clipboard/clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import styled, { useTheme } from 'styled-components/native';

import Card from '@components/Card';
import Icon from '@components/Icon';
import Pill from '@components/Pill';
import ScreenLayout from '@components/ScreenLayout';
import Skeleton from '@components/Skeleton';
import Text from '@components/Text';
import TokenIcon from '@components/TokenIcon';
import useBlockchainData from '@hooks/useBlockchainData';
import useConsolidatedCurrency from '@hooks/useConsolidatedCurrency';
import useNotifications from '@hooks/useNotifications';
import useTokenConversions from '@hooks/useTokenConversions';
import useWalletPublicValues from '@hooks/useWalletPublicValues';
import { TX_URL } from '@http/tx';
import { ScreenName } from '@navigation/constants';
import { MainNavigatorType } from '@navigation/MainNavigator';
import { formatAddress, numberToFiatBalance, numberToFormattedString } from '@utils/formatter';
import { isZero } from '@utils/number';
import { formatDate } from '@utils/time';
import { isSendTx, txStatus } from '@utils/web3';
import { GWEI } from '@web3/tokens';

type TxScreenProps = NativeStackScreenProps<MainNavigatorType, ScreenName.tx>;

const TOKEN_ICON_SIZE = 120;

const StyledTokenIcon = styled(TokenIcon)`
  align-self: center;
  margin: ${({ theme }) => theme.spacing(4)} 0 ${({ theme }) => theme.spacing(6)} 0;
`;

const FromToWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const Subtitle = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[20]};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const FromToIcon = styled(Icon) <{ color: string }>`
  color: ${({ color }) => color};
  margin: 0 ${({ theme }) => theme.spacing(3)};
`;

const RowData = styled(Text) <{ color?: string }>`
  color: ${({ color, theme }) => color || theme.colors.text.secondary};
`;

const Hash = styled(Text)`
  color: ${({ theme }) => theme.colors.info};
  text-decoration-line: underline;
`;

const AmountData = styled(Text) <{ color: string }>`
  color: ${({ color }) => color};
  font-size: ${({ theme }) => theme.fonts.size[20]};
  text-align: center;
`;

const Amount = styled.View`
  margin: ${({ theme }) => theme.spacing(4)} 0;
`;

const AmountSkeleton = styled(Skeleton)`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const AmountSkeletonWrapper = styled.View`
  align-self: center;
`;

const Gas = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledPill = styled(Pill)`
  max-width: 40%
`;

const Footer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const TxScreen = ({
  navigation,
  route,
}: TxScreenProps) => {
  const theme = useTheme();
  const { dispatchNotification } = useNotifications();

  const { address } = useWalletPublicValues();
  const { consolidatedCurrency } = useConsolidatedCurrency();
  const {
    blockchain,
    blockchainBaseToken,
  } = useBlockchainData();

  const {
    convert,
    tokenConversions,
  } = useTokenConversions({
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const {
    token,
    tx,
    forceHome,
  } = route.params;

  const txGasTotal = useMemo(() => BigInt(tx.gasPrice || '0') * (BigInt(tx.gasUsed || 0) || 0n), [tx]);
  const status = txStatus(tx);
  const isSending = isSendTx(tx, address);
  const txIcon = isSending ? 'arrow-right' : 'arrow-left';
  const txIconColor = isSending ? theme.colors.error : theme.colors.success;
  const txAddress = isSending ? tx.to : tx.from;
  const balance = BigInt(tx.value);

  const balanceFormatted = numberToFormattedString(balance || 0, { decimals: token.decimals });
  const balanceConverted = numberToFiatBalance(convert(balance || 0, token), consolidatedCurrency);

  const onPressAdress = (addressToCopy: string) => {
    Clipboard.setString(addressToCopy);
    dispatchNotification('notifications.addressCopied');
  };

  const onPressHash = () => Linking.openURL(`${TX_URL[blockchain]}${tx.hash}`);

  const goBack = () => {
    if (forceHome) {
      navigation.navigate(ScreenName.home);
      return;
    }

    navigation.goBack();
  };

  return (
    <ScreenLayout
      title="main.token.activity.tx.title"
      bigTitle
      scroll
      goBack={goBack}
    >
      <StyledTokenIcon
        tokenSymbol={token.symbol}
        size={TOKEN_ICON_SIZE}
        status={status}
      />
      <Card>
        <FromToWrapper>
          <StyledPill
            text={formatAddress(address!)}
            type="info"
            noI18n
            onPress={() => onPressAdress(address!)}
          />
          <FromToIcon name={txIcon} color={txIconColor} />
          <StyledPill
            text={formatAddress(txAddress)}
            type="info"
            noI18n
            onPress={() => onPressAdress(txAddress)}
          />
        </FromToWrapper>
        <Amount>
          <AmountData text={`${balanceFormatted} ${token.symbol}`} color={txIconColor} />
          <AmountSkeletonWrapper>
            <AmountSkeleton
              isLoading={!tokenConversions}
              width={150}
              height={20}
            >
              <AmountData text={balanceConverted} color={txIconColor} />
            </AmountSkeleton>
          </AmountSkeletonWrapper>
        </Amount>
        {!isZero(txGasTotal) && (
          <Gas>
            <Subtitle text="main.token.activity.tx.rows.gasTitle" />
            <RowData text="main.token.activity.tx.rows.gasUsed" i18nArgs={{ gasUsed: tx.gasUsed || 0 }} />
            <RowData text="main.token.activity.tx.rows.gasPrice" i18nArgs={{
              gasPrice: `${numberToFormattedString(tx.gasPrice || 0, {
                decimals: GWEI.toLowerCase(),
              })} ${GWEI}`,
            }} />
            <RowData text="main.token.activity.tx.rows.gasTotal" i18nArgs={{
              gasTotal: `${numberToFormattedString(txGasTotal, {
                decimals: blockchainBaseToken.decimals,
              })} ${blockchainBaseToken.symbol}`,
            }} />
          </Gas>
        )}
        <Subtitle text="main.token.activity.tx.rows.hash" />
        <Hash text={tx.hash} onPress={onPressHash} />
        <Footer>
          <Pill
            text={`main.token.activity.tx.status.${status}`}
            type={status}
          />
          <RowData text={formatDate(tx.timeStamp)} />
        </Footer>
      </Card>
    </ScreenLayout>
  );
};

export default TxScreen;
