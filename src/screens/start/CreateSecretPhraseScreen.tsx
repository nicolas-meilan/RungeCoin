import React, { useEffect } from 'react';

import {
  createSeedPhrase,
  createWalletFromSeedPhrase,
  createWalletFromKey,
} from '@web3/wallet';

const CreateSecretPhraseScreen = () => {

  useEffect(() => {
    (async () => {
      const seedPhrase = createSeedPhrase(true);

      console.log({ seedPhrase });

      const wallet = await createWalletFromSeedPhrase(seedPhrase);

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
    })();
  }, []);

  return (
    <></>
  );
};

export default CreateSecretPhraseScreen;
