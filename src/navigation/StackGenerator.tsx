import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack';

import ScreenName from './screenName';

const StackNavigator = createNativeStackNavigator();

type ScreenProps = {
  name: ScreenName;
  component: (props: NativeStackScreenProps<{
    [name in ScreenName]?: any;
  }, ScreenName>) => JSX.Element;
};

type StackProps = {
  screens: ScreenProps[];
};

const StackGenerator = ({ screens }: StackProps) => (
  <StackNavigator.Navigator initialRouteName={screens[0].name || ''}>
    {screens.map((screen: ScreenProps) => <StackNavigator.Screen key={screen.name} {...screen} />)}
  </StackNavigator.Navigator>
);

export default StackGenerator;
