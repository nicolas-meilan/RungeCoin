import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { ReactQueryKeys } from '@utils/constants';

type UseStartFlowFlagReturn = {
  comesFromStartFlow?: boolean | null;
  comesFromStartFlowLoading: boolean;
  setComesFromStartFlow: (comesFromStartFlow: boolean) => void;
};

const useStartFlowFlag = (): UseStartFlowFlagReturn => {
  const queryClient = useQueryClient();

  const {
    data: comesFromStartFlow,
    isLoading: comesFromStartFlowLoading,
  } = useQuery({
    queryKey: [ReactQueryKeys.START_FLOW_FLAG],
    queryFn: () => false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const setFlag = async (newComesFromStartFlow: boolean) => newComesFromStartFlow;

  const { mutate: mutateComesFromStartFlow } = useMutation({
    mutationKey: [ReactQueryKeys.START_FLOW_FLAG],
    mutationFn: setFlag,
  });

  const setComesFromStartFlow = (newComesFromStartFlow: boolean) => mutateComesFromStartFlow(newComesFromStartFlow, {
    onSuccess: () => queryClient.setQueryData([ReactQueryKeys.START_FLOW_FLAG], newComesFromStartFlow),
  });

  return {
    comesFromStartFlow,
    comesFromStartFlowLoading,
    setComesFromStartFlow,
  };
};

export default useStartFlowFlag;
