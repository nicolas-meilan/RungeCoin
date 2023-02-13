import { createHash } from 'crypto';

import {
  getSupportedBiometryType,
  setGenericPassword,
  getGenericPassword,
  resetGenericPassword,
  ACCESS_CONTROL,
  ACCESSIBLE,
  AUTHENTICATION_TYPE,
} from 'react-native-keychain';

export const hashFrom = (toHash: string): string => createHash('sha256').update(toHash).digest('hex');

export const deviceHasBiometrics = async () => {
  const biometricsType = await getSupportedBiometryType();

  return !!biometricsType;
};

const BIOMETRICS = 'biometrics';

export const toggleBiometrics = (enable?: boolean) => {
  if (enable) {
    return setGenericPassword(BIOMETRICS, BIOMETRICS, {
      service: BIOMETRICS,
      accessControl: ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
      accessible: ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
      authenticationType: AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
    });
  } else {
    return resetGenericPassword();
  }
};

export const obtainBiometrics = () => getGenericPassword({
  service: BIOMETRICS,
});
