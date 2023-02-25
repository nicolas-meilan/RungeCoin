import React from 'react';
import { ScrollView, StyleProp, ViewStyle } from 'react-native';

import QRCode from 'react-native-qrcode-svg';
import styled from 'styled-components/native';

import Card from './Card';
import Text from './Text';
import useWalletPublicValues from '@hooks/useWalletPublicValues';

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
const scrollviewContentStyle: StyleProp<ViewStyle> = {
  alignItems: 'center',
};

const Receive = ({ onPressAddress }: ReceiveProps) => {
  const { walletPublicValues } = useWalletPublicValues();
  const address = walletPublicValues!.address;

  const onPress = () => onPressAddress?.(address);

  return (
    <ScrollView contentContainerStyle={scrollviewContentStyle}>
      <Title text="main.receive.title" />
      <QRCard
        touchable={!!onPressAddress}
        onPress={onPress}
      >
        <QRCode
          value={address}
          size={250}
        />
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
