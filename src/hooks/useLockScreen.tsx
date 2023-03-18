import { RefObject, useState } from 'react';

import { NavigationContainerRef } from '@react-navigation/native';

import useAppState from './useAppState';
import { ScreenName } from '@navigation/constants';
import { MainNavigatorType } from '@navigation/MainNavigator';

const MS_TO_LOCK = 60000;

export const useLockScreen = (
  navigatorRef: RefObject<NavigationContainerRef<MainNavigatorType>>,
  hasAccess: boolean = false,
) => {

  const [time, setTime] = useState(Date.now());

  const accessValidations = (callback: () => void) => () => {
    if (!hasAccess) return;

    callback();
  };

  const onAppActive = () => {
    const currentScreen = navigatorRef.current?.getCurrentRoute()?.name;
    if (currentScreen === ScreenName.validateAccess) return;

    const currentTime = Date.now();
    const timeDif = currentTime - time;

    if (timeDif >= MS_TO_LOCK) navigatorRef.current?.navigate(ScreenName.validateAccess, { comesFromBackground: true });
  };

  const onAppBackground = () => setTime(Date.now());

  useAppState({
    onActive: accessValidations(onAppActive),
    onBackground: accessValidations(onAppBackground),
  });
};

export default useLockScreen;
