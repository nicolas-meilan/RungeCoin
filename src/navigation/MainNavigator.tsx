import React from 'react';

import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';

import {
  ScreenName,
  screenOptions,
} from './constants';
import HomeScreen from '@screens/main/HomeScreen';
import SendScreen from '@screens/main/SendScreen';
import TokenScreen from '@screens/main/TokenScreen';
import ValidateAccessScreen from '@screens/main/ValidateAccessScreen';
import type { TokenSymbol } from '@web3/tokens';

export type MainNavigatorType = {
  [ScreenName.validateAccess]: undefined;
  [ScreenName.home]: undefined;
  [ScreenName.send]: { tokenToSendSymbol?: TokenSymbol } | undefined;
  [ScreenName.token]: { tokenSymbol: TokenSymbol };
};

type ScreenProps = {
  name: keyof MainNavigatorType;
  component: (props: any) => JSX.Element;
  options?: NativeStackNavigationOptions;
};

const screens: ScreenProps[] = [{
  name: ScreenName.validateAccess,
  component: ValidateAccessScreen,
  options: { gestureEnabled: false },
}, {
  name: ScreenName.home,
  component: HomeScreen,
}, {
  name: ScreenName.send,
  component: SendScreen,
}, {
  name: ScreenName.token,
  component: TokenScreen,
}];

const StackNavigator = createNativeStackNavigator<MainNavigatorType>();

type MainNavigatorProps = {
  initialScreen?: keyof MainNavigatorType;
};

const MainNavigator = ({
  initialScreen = ScreenName.home,
}: MainNavigatorProps) => (
  <StackNavigator.Navigator
    screenOptions={screenOptions}
    initialRouteName={initialScreen}
  >
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

export default MainNavigator;
