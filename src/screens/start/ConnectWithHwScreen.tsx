import React from 'react';

import HwWalletConnector from '@components/HwWalletConnector';
import ScreenLayout from '@components/ScreenLayout';

const ConnectWithHwScreen = () => {

  return (
    <ScreenLayout
      title="access.connectHw.title"
      hasBack={false}
      bigTitle
    >
      <HwWalletConnector hasBlockchainSelector />
    </ScreenLayout>
  );
};

export default ConnectWithHwScreen;
