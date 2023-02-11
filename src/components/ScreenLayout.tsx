import React, { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import Icon from './Icon';
import KeyboardAvoidingView from './KeyboardAvoidingView';
import Svg from './Svg';
import Text from './Text';
import Title from './Title';
import logo from '@assets/logo.svg';

type ScreenLayoutProps = {
  children: JSX.Element | JSX.Element[];
  scroll?: boolean;
  title?: string;
  bigTitle?: boolean;
  hasBack?: boolean;
  hasFooterBanner?: boolean;
  keyboardAvoidingView?: boolean;
  goBack?: () => void;
};

const ScreenWrapper = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
  padding: ${({ theme }) => theme.spacing(6)};
`;

const StyledSafeArea = styled(SafeAreaView)`
  flex: 1;
`;

const StaticLayout = styled.View`
  flex-direction: row;
  width: 100%;
  height: ${({ theme }) => theme.spacing(10)};
`;

const Header = styled(StaticLayout)`
  align-items: center;
`;

const Footer = styled(StaticLayout)`
  align-items: flex-end;
  justify-content: center;
`;

const HeaderTitle = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[18]};
`;

const FooterText = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[16]};
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

const BaseWrapper = styled.View`
  flex: 1;
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const ScrollViewWrapper = styled.ScrollView`
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const ScreenLayout = ({
  children,
  title,
  goBack,
  scroll = false,
  hasBack = true,
  hasFooterBanner = false,
  bigTitle = false,
  keyboardAvoidingView = false,
}: ScreenLayoutProps) => {
  const navigation = useNavigation();
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardOpen(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardOpen(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const hasHeaderTitle = !bigTitle && !!title;
  const hasBigTitle = bigTitle && !!title;
  const hasHeader = hasHeaderTitle || hasBack;

  const backAction = goBack ? goBack : () => navigation.goBack();


  const contentScrollCondition = scroll
    ? <ScrollViewWrapper showsVerticalScrollIndicator={false}>{children}</ScrollViewWrapper>
    : <BaseWrapper>{children}</BaseWrapper>;

  const content = keyboardAvoidingView ? (
    <KeyboardAvoidingView>
      {contentScrollCondition}
    </KeyboardAvoidingView>
  ) : contentScrollCondition;

  return (
    <ScreenWrapper>
      <StyledSafeArea>
        {hasHeader && (
          <Header>
            {hasBack && <Icon onPress={backAction} name="chevron-left" />}
            {hasHeaderTitle && <HeaderTitle text={title} />}
          </Header>
        )}
        {hasBigTitle && <Title title={title} />}
        {content}
        {hasFooterBanner && !isKeyboardOpen && (
          <Footer>
            <FooterText text="common.appName" />
            <Svg svg={logo} size={24} />
          </Footer>
        )}
      </StyledSafeArea>
    </ScreenWrapper>
  );
};

export default ScreenLayout;
