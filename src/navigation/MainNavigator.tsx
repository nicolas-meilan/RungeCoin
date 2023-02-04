import React from 'react';

import ScreenName from './screenName';
import StackGenerator from './StackGenerator';
import HomeScreen from '@screens/main/HomeScreen';

const screens = [{
  name: ScreenName.home,
  component: HomeScreen,
}];

export default () => <StackGenerator screens={screens} />;