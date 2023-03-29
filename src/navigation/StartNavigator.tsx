import React from 'react';

import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';

import {
  ScreenName,
  screenOptions,
} from './constants';
import ConnectWithHwScreen from '@screens/start/ConnectWithHwScreen';
import CreateSeedPhraseScreen from '@screens/start/CreateSeedPhraseScreen';
import ObtainAccessScreen from '@screens/start/ObtainAccessScreen';
import PasswordForHwConnectionScreen from '@screens/start/PasswordForHwConnectionScreen';
import StartGuideScreen from '@screens/start/StartGuideScreen';
import WelcomeScreen from '@screens/start/WelcomeScreen';

export type StartNavigatorType = {
  [ScreenName.welcome]: undefined;
  [ScreenName.startGuide]: undefined;
  [ScreenName.obtainAccess]: { comesFromSeedPhraseCreation?: boolean } | undefined;
  [ScreenName.createSeedPhrase]: undefined;
  [ScreenName.passwordForHwConnection]: undefined;
  [ScreenName.connectWithHw]: undefined;
};

type ScreenProps = {
  name: keyof StartNavigatorType;
  component: (props: any) => JSX.Element;
  options?: NativeStackNavigationOptions;
};

const screens: ScreenProps[] = [{
  name: ScreenName.welcome,
  component: WelcomeScreen,
}, {
  name: ScreenName.startGuide,
  component: StartGuideScreen,
}, {
  name: ScreenName.obtainAccess,
  component: ObtainAccessScreen,
}, {
  name: ScreenName.createSeedPhrase,
  component: CreateSeedPhraseScreen,
}, {
  name: ScreenName.passwordForHwConnection,
  component: PasswordForHwConnectionScreen,
}, {
  name: ScreenName.connectWithHw,
  component: ConnectWithHwScreen,
}];

const StackNavigator = createNativeStackNavigator<StartNavigatorType>();

const StartNavigator = () => (
  <StackNavigator.Navigator screenOptions={screenOptions}>
    {screens.map((screen: ScreenProps) => (
      <StackNavigator.Screen
        key={screen.name}
        name={screen.name}
        component={screen.component}
        options={screen.options}
      />
    ))}
  </StackNavigator.Navigator>
);

export default StartNavigator;
