import MainNavigator from './MainNavigator';
import StartNavigator from './StartNavigator';

const Navigator = () => {
  const hasWalletAccess = false; // TODO

  return hasWalletAccess ? <MainNavigator /> : <StartNavigator />;
};

export default Navigator;
