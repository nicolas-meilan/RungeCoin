import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

import { ReactQueryKeys } from '@utils/constants';

export enum NotificationTypes {
  ERROR = 'error',
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning',
}

export type Notification = {
  message: string;
  type: NotificationTypes;
};

type UseNotificationsReturn = {
  notification?: Notification | null;
  notificationLoading: boolean;
  dispatchNotification: (message: Notification['message'], type: Notification['type']) => void;
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

  const dispatchNotification = (
    message: Notification['message'],
    type: Notification['type'],
  ) => queryClient.setQueryData([ReactQueryKeys.NOTIFICATIONS], { message, type });

  const resetNotification = () => queryClient.setQueryData([ReactQueryKeys.NOTIFICATIONS], null);

  return {
    notification,
    notificationLoading,
    dispatchNotification,
    resetNotification,
  };
};

export default useNotifications;
