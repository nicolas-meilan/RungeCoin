import React, { useEffect, useState } from 'react';

import { Camera } from 'react-native-camera-kit';
import styled, { useTheme } from 'styled-components/native';

import BottomSheet from '@containers/Bottomsheet';
import { requestCameraPermission } from '@system/camera';

type QrScannerProps = {
  onScan: (qrCode: string) => void;
  visible?: boolean;
  onClose: () => void;
  closeAfterScan?: boolean;
  title?: string;
  message?: string;
};

const StyledCamera = styled(Camera)`
  flex: 1;
`;

const QrScanner = ({
  onScan,
  visible,
  onClose,
  closeAfterScan = false,
}: QrScannerProps) => {
  const theme = useTheme();

  const [hasPermission, setHasPermission] = useState(false);

  const handleScan = ({
    nativeEvent: {
      codeStringValue,
    },
  }: {
    nativeEvent: {
      codeStringValue: string | null;
    };
  }) => {
    if (codeStringValue) {
      onScan(codeStringValue);
      if (closeAfterScan) onClose();
    }
  };

  useEffect(() => {
    if (visible) {
      requestCameraPermission().then((permissions) => {
        setHasPermission(permissions);
        if (!permissions) onClose();
      });

      return;
    }

  }, [visible]);

  if (!hasPermission) return null;

  return (
    <BottomSheet
      headerOverlay
      withoutMargins
      closeButton
      visible={visible}
      onClose={onClose}
      topMargin={0}
    >
      <StyledCamera
        flashMode="off"
        showFrame
        scanBarcode
        onReadCode={handleScan}
        frameColor={theme.colors.info}
        laserColor={theme.colors.transparent}
      />
    </BottomSheet>
  );
};

export default QrScanner;
