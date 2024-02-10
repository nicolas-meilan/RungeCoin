import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import useNotifications from './useNotifications';
import useWalletPublicValues from './useWalletPublicValues';
import { ReactQueryKeys } from '@utils/constants';
import { getAccountResources } from '@web3/tx/tron.tx';
import { AccountResources } from '@web3/tx/types';

type UseTronAccountResourcesReturn = {
  accountResources?: AccountResources | null;
  accountResourcesLoading: boolean;
  refetchAccountResources: () => Promise<void>;
};

type QueryKey = [ReactQueryKeys];
type QueryOptions = UseQueryOptions<AccountResources | null, unknown, AccountResources | null, QueryKey>;
type UseTronAccountResourcesProps = {
  options?: Omit<QueryOptions, 'queryKey' | 'queryFn' | 'initialData'>;
};

const useTronAccountResources = ({
  options,
}: UseTronAccountResourcesProps = {}): UseTronAccountResourcesReturn => {
  const { address } = useWalletPublicValues();
  const { dispatchNotification } = useNotifications();

  const queryKey: QueryKey = [ReactQueryKeys.TRON_ACCOUNT_RESOURCES];

  const fetchAccountResources = () => {
    if (!address) return null;

    return getAccountResources(address);
  };

  const onError = () => dispatchNotification('error.accountResources', 'error');

  const {
    data: accountResources,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: fetchAccountResources,
    initialData: null,
    retry:false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    onError,
    ...(options || {}),
  });

  const refetchAccountResources = async () => {
    refetch();
  };

  return {
    accountResources,
    accountResourcesLoading: isLoading || isRefetching,
    refetchAccountResources,
  };
};

export default useTronAccountResources;
