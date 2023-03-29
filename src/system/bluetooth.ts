import {
  PermissionsAndroid,
  PermissionStatus,
  Platform,
} from 'react-native';

export const requestBluetoothScanPermission = async () => {
  if (Platform.OS === 'android') {

    const permissions: PermissionStatus[] = [];
    permissions.push(await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ));

    permissions.push(await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ));

    permissions.push(await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    ));

    return permissions.every((permission) => permission === PermissionsAndroid.RESULTS.GRANTED);
  }

  return true; // TODO iOS
};