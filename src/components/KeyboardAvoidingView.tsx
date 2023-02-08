import React from 'react';
import { KeyboardAvoidingViewProps, Platform } from 'react-native';

import styled from 'styled-components/native';

const StyledKeyboardAvoidingView = styled.KeyboardAvoidingView`
  flex: 1;
`;

const KeyboardAvoidingView = ({ children, ...props }: KeyboardAvoidingViewProps) => (
  <StyledKeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    {...props}
  >
    {children}
  </StyledKeyboardAvoidingView>
);

export default KeyboardAvoidingView;
