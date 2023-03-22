import { Camera } from 'react-native-vision-camera';

export const requestCameraPermission = async () => {
  const permission = await Camera.requestCameraPermission();

  return permission === 'authorized';
};
