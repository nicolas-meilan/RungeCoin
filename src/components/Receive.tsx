import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { ScrollView } from 'react-native-gesture-handler';
import QRCode from 'react-native-qrcode-svg';
import styled from 'styled-components/native';

import Card from './Card';
import Text from './Text';
import useWalletPublicValues from '@hooks/useWalletPublicValues';

const QR_SIZE = 250;
const QR_PADDING = 20;

type ReceiveProps = {
  onPressAddress?: (address: string) => void;
};

const Address = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[18]};
  color: ${({ theme }) => theme.colors.info};
  text-decoration-line: underline;
  text-align: center;
`;

const Title = styled(Text)`
  text-align: center;
  font-size: ${({ theme }) => theme.fonts.size[24]};
`;

const Message = styled(Text)`
  text-align: center;
  font-size: ${({ theme }) => theme.fonts.size[18]};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const QRCard = styled(Card)`
  margin: ${({ theme }) => theme.spacing(6)} 0;
`;

const QRWrapper = styled.View`
  width: ${QR_SIZE}px;
  height: ${QR_SIZE}px;
  border-radius: ${({ theme }) => theme.borderRadius};
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.statics.white};
`;

const scrollviewContentStyle: StyleProp<ViewStyle> = {
  alignItems: 'center',
};

const Receive = ({ onPressAddress }: ReceiveProps) => {
  const { walletPublicValues } = useWalletPublicValues();
  const address = walletPublicValues!.address;

  const onPress = () => onPressAddress?.(address);

  return (
    <ScrollView
      nestedScrollEnabled
      contentContainerStyle={scrollviewContentStyle}
    >
      <Title text="main.receive.title" />
      <QRCard
        touchable={!!onPressAddress}
        onPress={onPress}
      >
        <QRWrapper>
          <QRCode
            value={address}
            size={QR_SIZE - QR_PADDING}
            ecl="H"
          />
        </QRWrapper>
      </QRCard>
      <Message text="main.receive.qrMessage" />
      <Address
        text={address}
        onPress={onPress}
        noI18n
      />
    </ScrollView>
  );
};

export default Receive;
