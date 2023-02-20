import React, { useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';

import styled, { useTheme } from 'styled-components/native';

import Text from './Text';
import useNotifications, {
  Notification as TypeNotification,
} from '@hooks/useNotifications';
import { delay } from '@utils/time';

const NOTIFICATION_TIME = 5;

const NotificationWrapper = styled.View<{
  color: string;
  width: number;
}>`
  width: ${({ width }) => width}px;
  height: ${({ theme }) => theme.inputsHeight.small};
  background-color: ${({ color }) => color};
  border-radius: ${({ theme }) => theme.borderRadius};
  align-self: center;
  align-items: center;
  justify-content: center;
  position: absolute;
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  bottom: 0;
`;

const NotificationText = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[16]};
  color: ${({ theme }) => theme.colors.text.inverted};
`;

const Notification = () => {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const {
    notification,
    resetNotification,
  } = useNotifications({
    enabled: true,
    refetchOnMount: true,
  });

  const [notificationsQueue, setNotificationsQueue] = useState<TypeNotification[]>([]);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (notification) {
      setNotificationsQueue((prevNotificationsQueue: TypeNotification[]) => [
        ...prevNotificationsQueue,
        notification,
      ]);
    }
  }, [notification]);

  const dispatch = async () => {
    setShowNotification(true);

    await delay(NOTIFICATION_TIME);
    setNotificationsQueue((prevNotificationsQueue: TypeNotification[]) => {
      prevNotificationsQueue.shift();
      return [...prevNotificationsQueue];
    });
    resetNotification();
  };

  const hasNotifications = !!notificationsQueue.length;

  useEffect(() => {
    if (hasNotifications) {
      dispatch();
    }
  }, [hasNotifications]);

  if (!showNotification || !hasNotifications) return null;

  return (
    <NotificationWrapper
      color={theme.colors[notificationsQueue[0].type]}
      width={width - (2 * theme.spacingNative(6))}
    >
      <NotificationText text={notificationsQueue[0].message} />
    </NotificationWrapper>
  );
};

export default Notification;
