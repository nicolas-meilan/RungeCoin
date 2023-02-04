import React from 'react';

import ScreenName from './screenName';
import StackGenerator from './StackGenerator';
import CreateSecretPhraseScreen from '@screens/start/CreateSecretPhraseScreen';
import RequestSecretPhraseScreen from '@screens/start/RequestSecretPhraseScreen';

const screens = [{
  name: ScreenName.requestSecretphrase,
  component: RequestSecretPhraseScreen,
}, {
  name: ScreenName.createSecretPhrase,
  component: CreateSecretPhraseScreen,
}];

export default () => <StackGenerator screens={screens} />;
