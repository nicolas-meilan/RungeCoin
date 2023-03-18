import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

type UseAppStateProps = {
  onActive?: () => void;
  onInactive?: () => void;
  onBackground?: () => void;
};

const useAppState = ({
  onActive,
  onInactive,
  onBackground,
}: UseAppStateProps = {}) => {
  const [appState, setAppState] = useState(AppState.currentState);

  const action: {
    [key in typeof appState]?: () => void;
  } = {
    active: onActive,
    inactive: onInactive,
    background: onBackground,
  };

  useEffect(() => {
    const listener = AppState.addEventListener('change', (newState) => setAppState(newState));

    return () => listener.remove();
  }, []);

  useEffect(() => {
    action[appState]?.();
  }, [appState]);
};

export default useAppState;