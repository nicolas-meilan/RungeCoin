import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  ScreenName,
  screenOptions,
} from './constants';
import CreateSeedPhraseScreen from '@screens/start/CreateSeedPhraseScreen';
import RequestSeedPhraseScreen from '@screens/start/RequestSeedPhraseScreen';

export type StartNavigatorType = {
  [ScreenName.requestSeedPhrase]: undefined;
  [ScreenName.createSeedPhrase]: undefined;
};

type ScreenProps = {
  name: keyof StartNavigatorType;
  component: (props: any) => JSX.Element;
};

const screens: ScreenProps[] = [{
  name: ScreenName.requestSeedPhrase,
  component: CreateSeedPhraseScreen,
}, {
  name: ScreenName.createSeedPhrase,
  component: CreateSeedPhraseScreen,
}];

const StackNavigator = createNativeStackNavigator<StartNavigatorType>();

const StartNavigator = () => (
  <StackNavigator.Navigator screenOptions={screenOptions}>
    {screens.map((screen: ScreenProps) => (
      <StackNavigator.Screen
        key={screen.name}
        name={screen.name}
        component={screen.component}
      />
    ))}
  </StackNavigator.Navigator>
);

export default StartNavigator;
