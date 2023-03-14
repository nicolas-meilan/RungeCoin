import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  ScreenName,
  screenOptions,
} from './constants';
import HomeScreen from '@screens/main/HomeScreen';
import SendScreen from '@screens/main/SendScreen';
import ValidateAccessScreen from '@screens/main/ValidateAccessScreen';

export type MainNavigatorType = {
  [ScreenName.validateAccess]: undefined;
  [ScreenName.home]: undefined;
  [ScreenName.send]: { tokenToSendSymbol?: string } | undefined;
};

type ScreenProps = {
  name: keyof MainNavigatorType;
  component: (props: any) => JSX.Element;
};

const screens: ScreenProps[] = [{
  name: ScreenName.validateAccess,
  component: ValidateAccessScreen,
}, {
  name: ScreenName.home,
  component: HomeScreen,
}, {
  name: ScreenName.send,
  component: SendScreen,
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
      />
    ))}
  </StackNavigator.Navigator>
);

export default MainNavigator;
