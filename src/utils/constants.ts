export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

export enum ReactQueryKeys {
  THEME = 'theme',
  WALLET_PUBLIC_VALUES_KEY = 'wallet',
  ETH_BALANCE = 'ethBalance',
  START_FLOW_FLAG = 'startFlowFlag',
  BIOMETRICS = 'biometrics',
}
