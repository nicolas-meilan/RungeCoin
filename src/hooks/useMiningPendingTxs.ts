import { useState } from 'react';

import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import {
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import useBlockchainData from './useBlockchainData';
import type { WalletTx } from '@http/tx/types';
import StorageKeys from '@system/storageKeys';
import { ReactQueryKeys } from '@utils/constants';
import { Blockchains } from '@web3/constants';
import { processTxToSave } from '@web3/tx';
import { SenndTxReturn } from '@web3/tx/types';

type UseMiningPendingTxsReturn = {
  txs: WalletTx[];
  txsLoading: boolean;
  addTx: (tx: SenndTxReturn<WalletTx | undefined>) => void;
  removeTx: (txHash: string) => void;
  updateTxs: () => void;
};

type QueryKey = [ReactQueryKeys, Blockchains];
type QueryOptions = UseQueryOptions<WalletTx[] | null, unknown, WalletTx[] | null, QueryKey>;

type UseMiningPendingTxsProps = {
  options?: Omit<QueryOptions, 'queryKey' | 'queryFn'>;
  onAddError?: () => void;
  onAddSuccess?: (tx: WalletTx) => void;
  onRemoveError?: () => void;
  onUpdateError?: () => void;
};

const useMiningPendingTxs = ({
  options,
  onAddSuccess,
  onAddError,
  onRemoveError,
  onUpdateError,
}: UseMiningPendingTxsProps = {}): UseMiningPendingTxsReturn => {
  const queryClient = useQueryClient();
  const { blockchain } = useBlockchainData();
  const queryKey: QueryKey = [ReactQueryKeys.MINING_PENDING_TXS, blockchain];
  const storageKey = `${StorageKeys.MINING_PENDING_TXS}_${blockchain}`;

  const { getItem, setItem } = useAsyncStorage(storageKey);

  const [currentTxs, setCurrentTxs] = useState<WalletTx[]>([]);

  const getTxs = async (): Promise<WalletTx[]> => JSON.parse(await getItem() || '[]');

  const getStoredTxs = async () => {
    const storedTxs = await getTxs();
    setCurrentTxs(storedTxs);

    return storedTxs;
  };

  const { data: txs, isLoading } = useQuery({
    queryKey,
    queryFn: getStoredTxs,
    ...options,
  });

  const addTxToStorage = async (txData: SenndTxReturn<WalletTx | undefined>) => {
    const txsToAddNew = currentTxs.length
      ? currentTxs
      : (await getTxs());

    const tx = await processTxToSave({
      hash: txData.hash,
      tx: txData.tx,
      blockchain,
    });

    if (!tx) return txsToAddNew;

    const newTxs = [...txsToAddNew, tx];
    await setItem(JSON.stringify(newTxs));
    setCurrentTxs(newTxs);

    return newTxs;
  };

  const { mutate: mutateAddTx, isLoading: mutationAddTxLoading } = useMutation({
    mutationKey: queryKey,
    mutationFn: addTxToStorage,
    onError: onAddError,
  });

  const addTx: UseMiningPendingTxsReturn['addTx'] = (txData) => mutateAddTx(txData, {
    onSuccess: (newTxs) => {
      queryClient.setQueryData(queryKey, newTxs);
      onAddSuccess?.(newTxs[newTxs.length - 1]);
    },
  });


  const removeStoredTx = async (txHash: string) => {
    const txsToRemove = currentTxs.length
      ? currentTxs
      : (await getTxs());

    const indexOfTxToRemove = txsToRemove.findIndex(({ hash }) => txHash === hash);

    delete txsToRemove[indexOfTxToRemove];

    await setItem(JSON.stringify(txsToRemove));
    setCurrentTxs([...txsToRemove]);

    return txsToRemove;
  };

  const updateStoredTxs = async () => {
    const allTxs = currentTxs.length
      ? currentTxs
      : (await getTxs());

    const updatedTxs = await Promise.all(allTxs.map((currentTx) => processTxToSave({
      hash: currentTx.hash,
      blockchain,
      tx: currentTx,
      needsUpdate: true,
    })));

    const newTxs = updatedTxs.reduce((acc: WalletTx[], tx, index) => {
      if (!tx) return [...acc, allTxs[index]]; // error on the web3 response
      if (tx.confirmations) return acc; // tx processed

      return [...acc, tx]; // tx updated
    }, []);

    await setItem(JSON.stringify(newTxs));
    setCurrentTxs(newTxs);

    return newTxs;
  };

  const { mutate: mutateRemoveTx, isLoading: mutationRemoveTxLoading } = useMutation({
    mutationKey: queryKey,
    mutationFn: removeStoredTx,
    onError: onRemoveError,
  });

  const removeTx = (txHash: string) => mutateRemoveTx(txHash, {
    onSuccess: (newTxs) => queryClient.setQueryData(queryKey, newTxs),
  });

  const { mutate: mutateUpdateTxs, isLoading: mutationUpdateTxsLoading } = useMutation({
    mutationKey: queryKey,
    mutationFn: updateStoredTxs,
    onError: onUpdateError,
  });

  const updateTxs = () => mutateUpdateTxs(undefined, {
    onSuccess: (newTxs) => queryClient.setQueryData(queryKey, newTxs),
  });

  return {
    txs: txs || [],
    addTx,
    removeTx,
    updateTxs,
    txsLoading: isLoading
      || mutationAddTxLoading
      || mutationRemoveTxLoading
      || mutationUpdateTxsLoading,
  };
};

export default useMiningPendingTxs;
