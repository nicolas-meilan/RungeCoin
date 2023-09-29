import React, { useImperativeHandle, useState } from 'react';

import Pin from '@components/Pin';
import usePrivateKey from '@hooks/usePrivateKey';
import usePrivateKeyConfig from '@hooks/usePrivateKeyConfig';
import { checkPin, storagePinFlagValue } from '@utils/pin';

export enum PrivateKeyEncryptionFlows {
  ENABLE_ENCRYPTION_FLOW = 'enable',
  DISABLE_ENCRYPTION_FLOW = 'disable',
  DECRYPTION_FLOW = 'decrypt',
}

export type DoublePrivateKeyEncryptionFlowRef = {
  startFlow: (flow: PrivateKeyEncryptionFlows, onSuccess?: (pin: string) => void) => void;
};

type FlowsAction = (pin: string) => (boolean | void) | Promise<boolean | void>;

const DoublePrivateKeyEncryptionFlow = React.forwardRef((
  {},
  ref: React.Ref<DoublePrivateKeyEncryptionFlowRef>,
) => {
  const {
    encryptPrivateKeys,
    decryptPrivateKeys,
  } = usePrivateKey();

  const { setPrivateKeyDoubleEncryption } = usePrivateKeyConfig();

  const [pinVisible, setPinVisible] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [newPinError, setNewPinError] = useState(false);
  const [onSuccess, setOnSuccess] = useState<undefined | null | ((pin: string) => void)>(null);
  const [currentFlow, setCurrentFlow] = useState<PrivateKeyEncryptionFlows>(
    PrivateKeyEncryptionFlows.ENABLE_ENCRYPTION_FLOW,
  );

  const startFlow: DoublePrivateKeyEncryptionFlowRef['startFlow'] = (flow, newOnSuccess) => {
    if (pinVisible) return;

    setCurrentFlow(flow);
    setOnSuccess(() => newOnSuccess);
    setPinVisible(true);
  };

  useImperativeHandle(ref, () => ({ startFlow }));

  const onClosePin = () => {
    setNewPin('');
    setPinVisible(false);
  };

  const enableEncryptionFlow: FlowsAction = async (currentPin) => {
    if (!newPin) {
      setNewPin(currentPin);
      return true;
    }

    const isValidPin = newPin === currentPin;
    if (isValidPin) {
      Promise.all([
        encryptPrivateKeys(currentPin),
        storagePinFlagValue(currentPin),
      ]);
      setPrivateKeyDoubleEncryption(true); // never can fail
      onSuccess?.(currentPin);
      onClosePin();
    }

    setNewPinError(!isValidPin);
  };

  const disableEncryptionFlow: FlowsAction = async (currentPin) => {
    const isValidPin = await checkPin(currentPin);
    if (isValidPin) {
      await decryptPrivateKeys(currentPin);
      setPrivateKeyDoubleEncryption(false);
      onClosePin();
      onSuccess?.(currentPin);
      return true;
    }

    return false;
  };

  const decryptFlow: FlowsAction = async (currentPin) => {
    const isValidPin = await checkPin(currentPin);

    if (isValidPin) {
      onSuccess?.(currentPin);
      onClosePin();

      return true;
    }

    return false;
  };

  const enableEncryptionFlowBack = newPin ? () => {
    setNewPin('');
    setNewPinError(false);
  } : undefined;

  const FLOWS_CONFIG: {
    [flow in PrivateKeyEncryptionFlows]: {
      title?: string;
      validatePinAttemps: boolean;
      action: FlowsAction;
      onBack?: () => void;
    }
  } = {
    [PrivateKeyEncryptionFlows.ENABLE_ENCRYPTION_FLOW]: {
      title: `main.pin.${newPin ? 'reEnterPin' : 'createPin'}`,
      validatePinAttemps: false,
      action: enableEncryptionFlow,
      onBack: enableEncryptionFlowBack,
    },
    [PrivateKeyEncryptionFlows.DISABLE_ENCRYPTION_FLOW]: {
      title: 'main.pin.enterPin',
      validatePinAttemps: true,
      action: disableEncryptionFlow,
    },
    [PrivateKeyEncryptionFlows.DECRYPTION_FLOW]: {
      title: 'main.pin.enterPin',
      validatePinAttemps: true,
      action: decryptFlow,
    },
  };

  const currentConfig = FLOWS_CONFIG[currentFlow];

  return (
    <Pin
      visible={pinVisible}
      title={currentConfig.title}
      validatePinAttemps={currentConfig.validatePinAttemps}
      onPinEntered={currentConfig.action}
      onBack={currentConfig.onBack}
      hasBack={!!currentConfig.onBack}
      onClose={onClosePin}
      customErrorMessage="main.pin.newPinError"
      showCustomError={newPinError}
    />
  );
});

export default DoublePrivateKeyEncryptionFlow;
