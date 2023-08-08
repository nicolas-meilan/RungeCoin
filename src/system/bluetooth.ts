import {
  Permission,
  PermissionsAndroid,
  Platform,
} from 'react-native';

import BleManager, { BleState } from 'react-native-ble-manager';

const BLUETOOTH_PERMISSIONS: Permission[] = [
  PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
];

export const BE_DISABLED = 'beDisabled';

export const requestBluetoothScanPermission = async () => {
  if (Platform.OS === 'android') {

    const permissions = await PermissionsAndroid.requestMultiple(BLUETOOTH_PERMISSIONS);

    const permissionsKeys = Object.keys(permissions) as Permission[];
    const hasPermissions = permissionsKeys.length
      ? permissionsKeys.reduce((
        acc: boolean,
        permissionKey: Permission,
      ) => {
        if (BLUETOOTH_PERMISSIONS.includes(permissionKey)) {
          acc &&= permissions[permissionKey] === PermissionsAndroid.RESULTS.GRANTED;
        }
        return acc;
      }, true)
      : false;

    return hasPermissions;
  }

  return false; // TODO iOS
};

export const isBeEnabled = async () => {
  const beEnabled = await BleManager.checkState();

  return beEnabled === BleState.On;
};
