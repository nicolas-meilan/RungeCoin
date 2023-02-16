import React, { useEffect, useMemo } from 'react';

import ScreenLayout from '@components/ScreenLayout';
import Text from '@components/Text';
import useBalances from '@hooks/useBalances';
import { bigNumberToFormattedString } from '@utils/formatter';

const HomeScreen = () => {
  const { tokenBalances, tokenBalancesLoading } = useBalances();

  const loading  = useMemo(() => tokenBalancesLoading && !tokenBalances, [tokenBalances, tokenBalancesLoading]);

  useEffect(() => {
    if (!tokenBalances) return;
    console.log(tokenBalances);
    console.log(bigNumberToFormattedString(tokenBalances.ETH, 18));
    console.log(bigNumberToFormattedString(tokenBalances.DAI, 18));
    console.log(bigNumberToFormattedString(tokenBalances.BNB, 18));
    console.log(bigNumberToFormattedString(tokenBalances.MATIC, 18));
    console.log(bigNumberToFormattedString(tokenBalances.USDT, 6));
  }, [tokenBalances]);
  if (loading) return <></>; // TODO add skeleton

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
