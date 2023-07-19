import React from 'react';

import styled from 'styled-components/native';

import Card from './Card';
import ErrorWrapper from './ErrorWrapper';
import Pill from './Pill';
import Skeleton from './Skeleton/Skeleton';
import Text from './Text';
import useBlockchainData from '@hooks/useBlockchainData';
import useConsolidatedCurrency from '@hooks/useConsolidatedCurrency';
import useTokenConversions from '@hooks/useTokenConversions';
import { numberToFiatBalance, numberToFormattedString } from '@utils/formatter';
import { GWEI, TokenType } from '@web3/tokens';
import { TRON_TX_NEEDS_ACTIVATION_ERROR } from '@web3/tx/tron.tx';
import { TxFees } from '@web3/tx/types';

type EstimatedTxFeeProps = {
  token: TokenType;
  txFee?: TxFees | null;
  loading?: boolean;
  hasNotBalanceForFee?: boolean;
  error?: string;
  onRefetchError: () => void;
};

const GasTitle = styled(Text).attrs({
  weight: 'bold',
}) <{ avoidTopMargin?: boolean }>`
  font-size: ${({ theme }) => theme.fonts.size[18]};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ avoidTopMargin, theme }) => (avoidTopMargin ? 0 : theme.spacing(2))};
`;

const TotalFeeText = styled(Text) <{ error: boolean }>`
  ${({ error, theme }) => (error ? `
    color: ${theme.colors.error};
  ` : '')}
`;

const FeeTextWrapper = styled.View<{ withMargin?: boolean }>`
  flex-direction: row;
  align-items: center;
  ${({ theme, withMargin }) => (withMargin ? `
    margin-top: ${theme.spacing(2)}
  ` : '')}
`;

const StyledPill = styled(Pill) <{ withSpacing?: boolean }>`
  font-size: ${({ theme }) => theme.fonts.size[12]};
  padding: 2px;
  align-self: flex-start;
  text-align: center;
  margin-left: ${({ theme, withSpacing }) => (withSpacing
    ? theme.spacing(2)
    : 0)};
`;

const TronNeedsActivationError = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[16]};
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
`;

const EstimatedTxFee = ({
  txFee,
  token,
  onRefetchError,
  loading = false,
  hasNotBalanceForFee = false,
  error = '',
}: EstimatedTxFeeProps) => {
  const { convert } = useTokenConversions({
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const { consolidatedCurrency } = useConsolidatedCurrency();
  const { blockchainBaseToken } = useBlockchainData();

  const isErc20Fee = txFee?.gasPrice && txFee.gasUnits;
  const isTronFee = txFee?.bandwithPrice && txFee.energyPrice;

  const tronNeedsActivateError = error === TRON_TX_NEEDS_ACTIVATION_ERROR;
  if (tronNeedsActivateError) {
    return (
      <TronNeedsActivationError
        text="error.tronNeedsActivation"
        i18nArgs={{ token: token.symbol }}
      />
    );
  }

  return (
    <ErrorWrapper
      requiredValuesToRender={[txFee]}
      retryCallback={onRefetchError}
      isLoading={loading}
    >
      <Card>
        <GasTitle text="main.send.fee" avoidTopMargin />
        <Skeleton
          isLoading={loading}
          height={14}
          width="90%"
          quantity={5}
        >

          {isErc20Fee && (
            <>
              <Text
                text="main.send.gasUnits"
                i18nArgs={{
                  units: txFee.gasUnits.toNumber(),
                }}
              />
              <Text
                text="main.send.gasPrice"
                i18nArgs={{
                  price: `${numberToFormattedString(txFee.gasPrice, {
                    decimals: GWEI.toLowerCase(),
                  })} ${GWEI}`,
                }}
              />
            </>
          )}
          {isTronFee && (
            <>
              <FeeTextWrapper>
                <Text
                  text="main.send.bandwith"
                  i18nArgs={{
                    bandwith: numberToFormattedString(txFee.bandwithNeeded),
                  }}
                />
                {txFee.bandwithFee.isZero() && <StyledPill text="common.free" type="success" withSpacing />}
              </FeeTextWrapper>
              {!!txFee.energyNeeded && (
                <FeeTextWrapper withMargin>
                  <Text
                    text="main.send.energy"
                    i18nArgs={{
                      energy: numberToFormattedString(txFee.energyNeeded),
                    }}
                  />
                  {txFee.energyFee.isZero() && <StyledPill text="common.free" type="success" withSpacing />}
                </FeeTextWrapper>
              )}
              {!txFee.activationFee.isZero() && (
                <FeeTextWrapper withMargin>
                  <Text
                    text="main.send.activationAccountFee"
                    i18nArgs={{
                      fee: `${numberToFormattedString(txFee.activationFee, {
                        decimals: blockchainBaseToken.decimals,
                      })} ${blockchainBaseToken.symbol}`,
                    }}
                  />
                </FeeTextWrapper>
              )}
            </>
          )}
          {!txFee?.totalFee.isZero() && (
            <>
              <GasTitle text="main.send.totalFee" />
              <TotalFeeText
                error={hasNotBalanceForFee}
                text={`≈ ${numberToFormattedString(txFee?.totalFee || 0, {
                  decimals: blockchainBaseToken.decimals,
                })} ${blockchainBaseToken.symbol}`}
              />
              <Text
                text={numberToFiatBalance(
                  convert(txFee?.totalFee || 0, blockchainBaseToken),
                  consolidatedCurrency,
                )}
              />
            </>
          )}
        </Skeleton>
      </Card>
    </ErrorWrapper>
  );
};

export default EstimatedTxFee;
