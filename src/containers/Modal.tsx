import React from 'react';
import {
  Modal as ModalRN,
  ModalProps,
} from 'react-native';

import Providers from './Providers';

const Modal = ({ children, ...props }: ModalProps) => (
  <ModalRN {...props}>
    <Providers>
      {children}
    </Providers>
  </ModalRN>
);

export default Modal;
