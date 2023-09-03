import { PermissionsAndroid, Platform } from 'react-native';

import { Camera } from 'react-native-camera-kit';

const requestCameraPermissionAndroid = async () => {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

export const requestCameraPermission = async () => {
  const permission = await (Platform.OS === 'android'
    ? requestCameraPermissionAndroid()
    : Camera.requestDeviceCameraAuthorization());

  return permission;
};
