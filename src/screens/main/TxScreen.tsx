import React from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import ScreenLayout from '@components/ScreenLayout';
import { ScreenName } from '@navigation/constants';
import { MainNavigatorType } from '@navigation/MainNavigator';

type TxScreenProps = NativeStackScreenProps<MainNavigatorType, ScreenName.tx>;

const TxScreen = ({ route }: TxScreenProps) => {
  const {
    token,
    tx,
  } = route.params;
  console.log(tx.hash);

  return (
    <ScreenLayout
      title={token.name}
      bigTitle
    >
      <></>
    </ScreenLayout>
  );
};

export default TxScreen;