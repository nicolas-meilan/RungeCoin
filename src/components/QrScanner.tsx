import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

import {
  HandlerStateChangeEvent,
  TapGestureHandler,
  TapGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import styled from 'styled-components/native';
import { BarcodeFormat, useScanBarcodes } from 'vision-camera-code-scanner';

import BottomSheet from '@containers/Bottomsheet';
import { requestCameraPermission } from '@system/camera';

const CAMERA_CORNERS_SIZE = 80;
const CameraCorner = styled.View<{
  positionV: 'top' | 'bottom';
  positionH: 'left' | 'right';
}>`
  position: absolute;
  width: ${CAMERA_CORNERS_SIZE}px;
  height: ${CAMERA_CORNERS_SIZE}px;
  background-color: ${({ theme }) => theme.colors.info};
    ${({
    positionH,
    positionV,
    theme,
  }) => {
    const orientation = theme.spacingNative(5) - theme.spacingNative(2.5);

    return `
      ${positionV}: ${orientation}px;
      ${positionH}: ${orientation}px;
      border-${positionV}-${positionH}-radius: ${theme.borderRadius};
    `;
  }}
`;

const BaseCameraWrapper = styled.View<{ size: number }>`
  width: 100%;
  height: ${({ size }) => size}px;
  align-items: center;
  justify-content: center;
`;

const CameraWrapper = styled.View<{ size: number }>`
  width: ${({ size, theme }) => size - theme.spacingNative(10)}px;
  height: ${({ size, theme }) => size - theme.spacingNative(10)}px;
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid ${({ theme }) => theme.colors.info};
  overflow: hidden;
`;

const StyledCamera = styled(Camera) <{ size: number }>`
  width: ${({ size, theme }) => size - theme.spacingNative(10)}px;
  height: ${({ size, theme }) => size - theme.spacingNative(10)}px;
`;

const SCAN_FPS = 60;

type QrScannerProps = {
  onScan: (qrCode: string) => void;
  visible?: boolean;
  onClose: () => void;
  closeAfterScan?: boolean;
};

type Focus = {
  x: number;
  y: number;
};

const QrScanner = ({
  onScan,
  visible,
  onClose,
  closeAfterScan = false,
}: QrScannerProps) => {
  const cameraRef = useRef<Camera>(null);
  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE], { checkInverted: true });

  const [hasPermission, setHasPermission] = useState(false);
  const [focus, setFocus] = useState<Focus | null>(null);
  const [focusLoading, setFocusLoading] = useState(false);
  const [cameraSize, setCameraSize] = useState(0);
  const [qrCode, setQrCode] = useState('');

  const devices = useCameraDevices();
  const backCamera = devices.back;

  useEffect(() => {
    if (visible) {
      requestCameraPermission().then((permissions) => {
        setHasPermission(permissions);
        if (!permissions) onClose();
      });
    }
  }, [visible]);

  useEffect(() => {
    if (!focusLoading && focus) {
      setFocusLoading(true);
      cameraRef.current?.focus(focus)
        .then(() => setFocusLoading(false))
        .catch(() => setFocusLoading(false));
    }
  }, [focus]);

  useEffect(() => {
    const newQrcode = barcodes[0]?.displayValue;

    if (newQrcode) setQrCode(newQrcode);
  }, [barcodes]);

  useEffect(() => {
    if (qrCode) {
      onScan(qrCode);
      if (closeAfterScan) onClose();
    }
  }, [qrCode]);

  const onTap = async (event: HandlerStateChangeEvent<TapGestureHandlerEventPayload>) => {
    const newFocus = {
      x: event.nativeEvent.x,
      y: event.nativeEvent.y,
    };

    setFocus((prevFocus) => {
      const focusAreEquals = prevFocus?.x === newFocus.x && prevFocus.y === newFocus.y;
      if (focusAreEquals) return prevFocus;

      return newFocus;
    });
  };

  const onCameraSizeChange = (event: LayoutChangeEvent) => setCameraSize(event.nativeEvent.layout.width);

  if (!hasPermission || !backCamera) return null;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
    >
      <BaseCameraWrapper size={cameraSize} onLayout={onCameraSizeChange}>
        <CameraCorner positionH="left" positionV="top" />
        <CameraCorner positionH="right" positionV="top" />
        <CameraCorner positionH="left" positionV="bottom" />
        <CameraCorner positionH="right" positionV="bottom" />
        <CameraWrapper size={cameraSize}>
          {!!cameraSize && (
            <TapGestureHandler onHandlerStateChange={onTap}>
              <StyledCamera
                isActive
                size={cameraSize}
                ref={cameraRef}
                device={backCamera}
                frameProcessor={frameProcessor}
                frameProcessorFps={SCAN_FPS}
              />
            </TapGestureHandler>
          )}
        </CameraWrapper>
      </BaseCameraWrapper>
    </BottomSheet>
  );
};

export default QrScanner;
