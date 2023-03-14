import React, { useEffect, useState } from 'react';
import { RefreshControl } from 'react-native';

import { useTheme } from 'styled-components/native';

type Pull2RefreshProps = {
  fetch: () => void;
  loading: boolean;
};

const usePull2Refresh = ({ fetch, loading }: Pull2RefreshProps) => {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const colorLoader = theme.colors.primary;

  const onRefresh = () => {
    setRefreshing(true);
    fetch();
  };

  useEffect(() => {
    if (!loading) setRefreshing(false);
  }, [loading]);

  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[colorLoader]}
      progressBackgroundColor={theme.colors.background.primary}
      tintColor={colorLoader}
    />
  );
};

export default usePull2Refresh;
