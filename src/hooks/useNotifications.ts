import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

import { ReactQueryKeys } from '@utils/constants';

type NotificationTypes = 'error' | 'success' | 'info' | 'warning';

export type Notification = {
  message: string;
  type: NotificationTypes;
  onPress?: () => void;
};

type UseNotificationsReturn = {
  notification?: Notification | null;
  notificationLoading: boolean;
  dispatchNotification: (
    message: Notification['message'],
    type?: Notification['type'],
    onPress?: Notification['onPress'],
  ) => void;
  resetNotification: () => void;
};

type QueryOptions = UseQueryOptions<Notification | null, unknown, Notification | null, ReactQueryKeys[]>;
type UseNotificationsProps = Omit<QueryOptions, 'queryKey' | 'queryFn' | 'initialData'>;

const useNotifications = (options: UseNotificationsProps = {}): UseNotificationsReturn => {
  const queryClient = useQueryClient();

  const {
    data: notification,
    isLoading: notificationLoading,
  } = useQuery({
    queryKey: [ReactQueryKeys.NOTIFICATIONS],
    queryFn: () => null,
    initialData: null,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: false,
    ...options,
  });

  const dispatchNotification: UseNotificationsReturn['dispatchNotification'] = (
    message,
    type = 'success',
    onPress = undefined,
  ) => queryClient.setQueryData([ReactQueryKeys.NOTIFICATIONS], { message, type, onPress });

  const resetNotification = () => queryClient.setQueryData([ReactQueryKeys.NOTIFICATIONS], null);

  return {
    notification,
    notificationLoading,
    dispatchNotification,
    resetNotification,
  };
};

export default useNotifications;
