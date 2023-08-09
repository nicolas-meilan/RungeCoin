import {
  Permission,
  PermissionsAndroid,
  Platform,
} from 'react-native';

import BleManager, { BleState } from 'react-native-ble-manager';
import DeviceInfo from 'react-native-device-info';

const deviceVersion = DeviceInfo.getSystemVersion();

const ANDROID_BLUETOOTH_PERMISSIONS: Permission[] = [
  PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  ...(parseFloat(deviceVersion) > 11
    ? [
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]
    : []
  ),
];

export const BE_DISABLED = 'beDisabled';

export const requestBluetoothScanPermission = async () => {
  if (Platform.OS === 'android') {

    const permissions = await PermissionsAndroid.requestMultiple(ANDROID_BLUETOOTH_PERMISSIONS);
    const permissionsKeys = Object.keys(permissions) as Permission[];
    const hasPermissions = permissionsKeys.length
      ? permissionsKeys.reduce((
        acc: boolean,
        permissionKey: Permission,
      ) => {
        if (ANDROID_BLUETOOTH_PERMISSIONS.includes(permissionKey)) {
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
