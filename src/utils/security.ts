import Aes from 'react-native-aes-crypto';
import {
  getSupportedBiometryType,
  setGenericPassword,
  getGenericPassword,
  resetGenericPassword,
  ACCESS_CONTROL,
  AUTHENTICATION_TYPE,
  STORAGE_TYPE,
  SECURITY_LEVEL,
  Options,
} from 'react-native-keychain';

export const hashFrom = (toHash: string) => Aes.sha256(toHash);

export const deviceHasBiometrics = async () => {
  const biometricsType = await getSupportedBiometryType();

  return !!biometricsType;
};

const BIOMETRICS = 'biometrics';

const biometricsConfig: Options = {
  service: BIOMETRICS,
  storage: STORAGE_TYPE.RSA,
  accessControl: ACCESS_CONTROL.BIOMETRY_ANY,
  authenticationType: AUTHENTICATION_TYPE.BIOMETRICS,
  securityLevel: SECURITY_LEVEL.SECURE_HARDWARE,
};

export const toggleBiometrics = (enable?: boolean) => {
  if (enable) {
    return setGenericPassword(BIOMETRICS, BIOMETRICS, biometricsConfig);
  } else {
    return resetGenericPassword(biometricsConfig);
  }
};

export const obtainBiometrics = (title?: string | null, cancel?: string | null) => getGenericPassword({
  ...biometricsConfig,
  ...(title || cancel ? {
    authenticationPrompt: {
      title: title || undefined,
      cancel: cancel || undefined,
    },
  } : {}),
});
