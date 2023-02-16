import React, { useEffect } from 'react';

import ScreenLayout from '@components/ScreenLayout';
import Text from '@components/Text';
import useWalletPublicValues from '@hooks/useWalletPublicValues';
import { getBalanceFromWallet } from '@web3/wallet';

const HomeScreen = () => {
  const { walletPublicValues } = useWalletPublicValues();

  useEffect(() => {
    const test = async () => {
      const val = await getBalanceFromWallet(walletPublicValues!.address);

      console.log({val});
    };

    test();
  }, []);

  return (
    <ScreenLayout
      title='main.home.title'
      bigTitle
      hasBack={false}
    >
      <Text text="test" />
    </ScreenLayout>
  );
};

export default HomeScreen;
