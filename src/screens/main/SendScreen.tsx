import React, { useEffect, useMemo, useState } from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import styled, { useTheme } from 'styled-components/native';

import BlockchainSelector from '@components/BlockchainSelector';
import Button from '@components/Button';
import Calculator from '@components/Calculator';
import EstimatedTxFee from '@components/EstimatedTxFee';
import HwConnectionSelector from '@components/HwConnectionSelector';
import QrScanner from '@components/QrScanner';
import ScreenLayout from '@components/ScreenLayout';
import Select, { Option } from '@components/Select';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import TokenIcon from '@components/TokenIcon';
import TokenItem from '@components/TokenItem';
import useBalances, { TokensBalanceArrayItem } from '@hooks/useBalances';
import useBiometrics from '@hooks/useBiometrics';
import useBlockchainData from '@hooks/useBlockchainData';
import useMiningPendingTxs from '@hooks/useMiningPendingTxs';
import useNotifications from '@hooks/useNotifications';
import useTx from '@hooks/useTx';
import useWalletPublicValues from '@hooks/useWalletPublicValues';
import type { WalletTx } from '@http/tx/types';
import { ScreenName } from '@navigation/constants';
import { MainNavigatorType } from '@navigation/MainNavigator';
import { TokenSymbol, TokenType } from '@web3/tokens';
import { isValidAddressToSend } from '@web3/tx';
import { SenndTxReturn } from '@web3/tx/types';
import { getAddressRegex } from '@web3/wallet';

const FooterWrapper = styled.View`
  margin-top: ${({ theme }) => theme.spacing(10)};
`;

const StyledSelector = styled(Select)`
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const AddressToSendInput = styled(TextInput)`
  margin-vertical: ${({ theme }) => theme.spacing(4)};
`;

const FeeMessage = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[16]};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;


const MiningPendingTxsMessage = styled(Text)`
  color: ${({ theme }) => theme.colors.warning};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const HwMessage = styled(Text)`
  margin: ${({ theme }) => theme.spacing(4)} 0 ${({ theme }) => theme.spacing(4)} 0;
`;

type SendScreenProps = NativeStackScreenProps<MainNavigatorType, ScreenName.send>;

const SendScreen = ({ navigation, route }: SendScreenProps) => {
  const theme = useTheme();
  const { dispatchNotification } = useNotifications();

  const [firstRender, setFirstRender] = useState(true);

  const {
    biometricsEnabled,
    dispatchBiometrics,
  } = useBiometrics();

  const {
    blockchain,
    isBlockchainInitialLoading,
    tokens: tokensObj,
    blockchainBaseToken,
  } = useBlockchainData();

  const {
    address: fromAddress,
    walletPublicValues,
    walletPublicValuesLoading,
  } = useWalletPublicValues();

  const tokens = useMemo(() => Object.values(tokensObj), [tokensObj]);

  const [tokenToSend, setTokenToSend] = useState<TokenType | null>(
    tokens.find(({ symbol }) => (symbol === route.params?.tokenToSendSymbol)) || null,
  );

  const onAddError = () => navigation.navigate(ScreenName.home);
  const onAddSuccess = (txData: WalletTx) => {
    if (!tokenToSend || !txData) return;

    navigation.navigate(ScreenName.tx, {
      token: tokenToSend,
      tx: txData,
      forceHome: true,
    });
  };

  const {
    addTx,
    updateTxs,
    txs,
    txsLoading,
  } = useMiningPendingTxs({
    onAddError,
    onAddSuccess,
  });

  const onSendFinish = (txData: SenndTxReturn<WalletTx | undefined>) => addTx(txData);

  const {
    estimatedTxFees,
    estimatedTxFeesLoading,
    estimatedTxFeesError,
    fetchEstimateTxFees,
    sendTokenLoading,
    sendToken,
    sendTokenError,
  } = useTx({ onSendFinish });

  const {
    orderTokens,
    tokenBalances,
    tokenBalancesLoading,
  } = useBalances({
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const [showCalculator, setShowCalculator] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);

  const [addressToSend, setAddressToSend] = useState('');
  const [addressToSendError, setAddressToSendError] = useState(false);

  const blockchainBaseTokenBalance = useMemo(() => (
    tokenBalances?.[blockchainBaseToken.symbol] || 0
  ), [blockchainBaseToken, tokenBalances]);

  const hasNotBalanceForGas = useMemo(() => (
    estimatedTxFees?.totalFee.gt(blockchainBaseTokenBalance) || false
  ), [estimatedTxFees, tokenBalances]);

  const allDataSetted = !addressToSendError && !!addressToSend && !!tokenToSend?.symbol;

  const onAddressChange = (newAddress: string) => {
    const isTheSameAddress = newAddress.toLowerCase() === fromAddress?.toLowerCase();
    const addressError = isTheSameAddress || !isValidAddressToSend(blockchain, newAddress);
    setAddressToSendError(!!newAddress && addressError);
    setAddressToSend(newAddress);
  };

  useEffect(() => {
    updateTxs();
    if (firstRender) {
      setFirstRender(false);
      return;
    }

    setTokenToSend(null);
    onAddressChange('');
  }, [blockchain]);

  const estimateFees = () => {
    if (!tokenToSend) return;
    fetchEstimateTxFees(addressToSend, tokenToSend);
  };

  useEffect(() => {
    if (allDataSetted) estimateFees();
  }, [tokenToSend, allDataSetted, addressToSend, addressToSendError]);

  useEffect(() => {
    if (sendTokenError) dispatchNotification('main.send.sendError', 'error');
  }, [sendTokenError]);

  const onTokenChange = (newToken: Option<TokenType>) => setTokenToSend(newToken.data);

  const openCalculator = () => setShowCalculator(true);
  const closeCalculator = () => setShowCalculator(false);

  const openQrScanner = () => setShowQrScanner(true);
  const closeQrScanner = () => setShowQrScanner(false);

  const onCalculatorEnd = async (amount: string) => {
    if (!tokenToSend) return;

    if (biometricsEnabled) {
      const success = await dispatchBiometrics();
      if (!success) return;
    }

    closeCalculator();
    if (estimatedTxFees?.totalFee.gt(blockchainBaseTokenBalance)) {
      dispatchNotification('main.send.notFoundsForFeeNotification', 'error');
      return;
    }
    sendToken(addressToSend, tokenToSend, amount);
  };

  const onScanQr = (qrCode: string) => {
    const addressRegex = getAddressRegex(blockchain);
    const address = addressRegex.exec(qrCode)?.[0] || '';

    const qrError = !isValidAddressToSend(blockchain, address);
    if (qrError) {
      dispatchNotification('main.send.invalidQr', 'error');
      setAddressToSend('');
      closeQrScanner();
      return;
    }

    setAddressToSendError(false);
    setAddressToSend(address);
    closeQrScanner();
  };

  const hasPendingTxsWithThisToken = useMemo(() => {
    if (!tokenToSend) return false;

    return !!txs.find((item) => item.contractAddress === tokenToSend.address);
  }, [txs, tokenToSend]);

  const tokensList = useMemo(() => {
    const tokensToSelect = orderTokens();
    if (!tokensToSelect) return [];

    return tokensToSelect.map((tokenBalanceItem: TokensBalanceArrayItem) => {
      const token = tokensObj[tokenBalanceItem.symbol as TokenSymbol]!;

      return {
        value: token.symbol as string,
        data: token,
        label: token.name,
        leftComponent: <TokenIcon tokenSymbol={token.symbol} size={24} />,
        disabled: !tokenBalances || tokenBalances?.[token.symbol].isZero(),
      };
    });
  }, [tokenBalances]);

  const goBack = () => {
    if (sendTokenLoading) return;

    navigation.goBack();
  };

  const areTheSameAddresses = addressToSend.toLowerCase() === fromAddress?.toLowerCase();
  const errorMessage = areTheSameAddresses
    ? 'main.send.inputs.sameAddressError'
    : 'main.send.inputs.addressError';

  return (
    <>
      <ScreenLayout
        bigTitle
        scroll
        title="main.send.title"
        disableHardwareBack
        goBack={goBack}
      >
        <BlockchainSelector
          label="main.send.inputs.blockchainSelectorLabel"
          disableBlockchainsWithoutAddress
          disabled={sendTokenLoading}
        />
        <StyledSelector
          selected={tokenToSend?.symbol}
          label="main.send.inputs.selectTokenLabel"
          placeholder="main.send.inputs.selectTokenPlaceholder"
          options={tokensList}
          disabled={sendTokenLoading}
          optionComponent={(option: Option<TokenType>, selected: boolean) => (
            <TokenItem
              fullName
              withoutMargin
              withBorders={selected}
              borderColor={theme.colors.success}
              disabled={tokenBalances?.[option.data.symbol].isZero()}
              balanceLoading={tokenBalancesLoading}
              balance={tokenBalances?.[option.data.symbol]}
              {...option.data}
            />
          )}
          onChange={onTokenChange}
        />
        <AddressToSendInput
          label="main.send.inputs.addressLabel"
          placeholder="main.send.inputs.addressPlaceholder"
          errorMessage={errorMessage}
          value={addressToSend}
          pressDisabled={sendTokenLoading}
          editable={!sendTokenLoading}
          onChangeText={onAddressChange}
          error={addressToSendError}
          icon="qrcode-scan"
          onPressIcon={openQrScanner}
        />
        {allDataSetted && !areTheSameAddresses && (
          <>
            {!estimatedTxFeesError && <FeeMessage text={`main.send.feeDescription.${blockchain}`} />}
            <EstimatedTxFee
              txFee={estimatedTxFees}
              loading={estimatedTxFeesLoading}
              onRetry={estimateFees}
            />
          </>
        )}
        {!!walletPublicValues?.isHw && (
          <>
            <HwMessage text={`hw.guide.${blockchain}`} />
            <HwConnectionSelector disabled={sendTokenLoading} />
          </>
        )}
        <FooterWrapper>
          {hasPendingTxsWithThisToken && (
            <MiningPendingTxsMessage text="main.send.miningPendingTxs" />
          )}
          <Button
            text="common.continue"
            disabled={!allDataSetted || hasNotBalanceForGas || !!estimatedTxFeesError}
            loading={estimatedTxFeesLoading
              || sendTokenLoading
              || isBlockchainInitialLoading
              || walletPublicValuesLoading
              || tokenBalancesLoading
              || txsLoading
            }
            onPress={openCalculator}
          />
        </FooterWrapper>
      </ScreenLayout>
      <Calculator
        visible={showCalculator}
        tokenSymbol={tokenToSend?.symbol}
        onClose={closeCalculator}
        onEnd={onCalculatorEnd}
        transactionFee={estimatedTxFees?.totalFee}
      />
      <QrScanner
        visible={showQrScanner}
        onClose={closeQrScanner}
        onScan={onScanQr}
      />
    </>
  );
};

export default SendScreen;
