import React from 'react';

import { useQuery } from '@tanstack/react-query';

import ScreenLayout from '@components/ScreenLayout';
import Text from '@components/Text';
import useWalletPublicValues from '@hooks/useWalletPublicValues';
import { getEthersOnEthereum } from '@http/cryptoScan';
import { ReactQueryKeys } from '@utils/constants';

const HomeScreen = () => {
  const { walletPublicValues } = useWalletPublicValues();

  const {
    data: ethBalance,
    isLoading: ethBalanceLoading,
  } = useQuery({
    queryKey: [ReactQueryKeys.ETH_BALANCE],
    queryFn: () => getEthersOnEthereum(walletPublicValues!.address),
  });

  if (!ethBalance && ethBalanceLoading) return <></>;

  return (
    <ScreenLayout
      title='main.home.title'
      bigTitle
      hasBack={false}
    >
      <Text text={ethBalance || '0'} />
    </ScreenLayout>
  );
};

export default HomeScreen;
