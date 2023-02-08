import React from 'react';

import ScreenName from './screenName';
import StackGenerator from './StackGenerator';
import CreateSeedPhraseScreen from '@screens/start/CreateSeedPhraseScreen';
import RequestSeedPhraseScreen from '@screens/start/RequestSeedPhraseScreen';

const screens = [{
  name: ScreenName.requestSeedPhrase,
  component: RequestSeedPhraseScreen,
}, {
  name: ScreenName.createSeedPhrase,
  component: CreateSeedPhraseScreen,
}];

export default () => <StackGenerator screens={screens} />;
