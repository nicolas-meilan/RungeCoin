import React, { useEffect } from 'react';

import {
  createSeedPhrase,
  createWalletFromSeedPhrase,
  createWalletFromKey,
} from '@web3/wallet';

const CreateSeedPhraseScreen = () => {


  const test = async (aa: string) => {
    console.log({ aa });

    const wallet = await createWalletFromSeedPhrase(aa);

    console.log({
      wallet: {
        privateKey: wallet.getPrivateKeyString(),
        publicKey: wallet.getPublicKeyString(),
        address: wallet.getAddressString(),
      },
    });

    const wallet2 = createWalletFromKey(wallet.getPrivateKeyString());

    console.log({ wallet2Address: wallet2.getAddressString() });

    const wallet3 = createWalletFromKey(wallet.getPublicKeyString(), false);

    console.log({ wallet3Address: wallet3.getAddressString() });

  };
  useEffect(() => {
    const seedPhrase = createSeedPhrase(true);
  }, []);

  return (
    <></>
  );
};

export default CreateSeedPhraseScreen;
