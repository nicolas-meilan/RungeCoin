import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  ScreenName,
  screenOptions,
} from './constants';
import HomeScreen from '@screens/main/HomeScreen';
import ValidateAccessScreen from '@screens/main/ValidateAccessScreen';

export type MainNavigatorType = {
  [ScreenName.validateAccess]: undefined;
  [ScreenName.home]: undefined;
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
}];

const StackNavigator = createNativeStackNavigator<MainNavigatorType>();

const MainNavigator = () => (
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

export default MainNavigator;
