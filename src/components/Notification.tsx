import React from 'react';
import { useWindowDimensions } from 'react-native';

import Animated, {
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import styled, { useTheme } from 'styled-components/native';

import Text from '../components/Text';
import type {
  Notification as TypeNotification,
} from '@hooks/useNotifications';

const StyledNotificationWrapper = styled.TouchableOpacity <{
  color: string;
  width: number;
}>`
  width: ${({ width }) => width}px;
  background-color: ${({ color }) => color};
  border-radius: ${({ theme }) => theme.borderRadius};
  align-self: center;
  align-items: center;
  justify-content: center;
  position: absolute;
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(2)};
  bottom: 0;
`;

const NotificationWrapper = Animated.createAnimatedComponent(StyledNotificationWrapper);

const NotificationText = styled(Text).attrs({
  weight: 'bold',
})`
  font-size: ${({ theme }) => theme.fonts.size[16]};
  color: ${({ theme }) => theme.colors.text.inverted};
  text-align: center;
`;

const ANIMATION_TIME = 500;
type NotificationProps = {
  notification: TypeNotification;
};

const Notification = ({
  notification,
}: NotificationProps) => {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  return (
    <NotificationWrapper
      width={width - (2 * theme.spacingNative(6))}
      color={theme.colors[notification.type]}
      entering={SlideInDown.duration(ANIMATION_TIME)}
      exiting={SlideOutDown.duration(ANIMATION_TIME)}
      onPress={notification.onPress}
      disabled={!notification.onPress}
    >
      <NotificationText text={notification.message} hasLinks={notification.hasLinks} />
    </NotificationWrapper>
  );
};

export default Notification;