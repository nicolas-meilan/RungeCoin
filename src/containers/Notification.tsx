import React, { useEffect, useState } from 'react';

import NotificationComponent from '@components/Notification';
import useNotifications, {
  Notification as TypeNotification,
} from '@hooks/useNotifications';
import { delay } from '@utils/time';

const NOTIFICATION_TIME = 3;

const Notification = () => {
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

  return <NotificationComponent notification={notificationsQueue[0]} />;
};

export default Notification;
