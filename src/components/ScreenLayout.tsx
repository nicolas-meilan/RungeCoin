import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  ActivityIndicator,
  Keyboard,
  ScrollViewProps,
} from 'react-native';

import {
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import BackgrounGradient from './BackgroundGradient';
import Icon from './Icon';
import KeyboardAvoidingView from './KeyboardAvoidingView';
import Svg from './Svg';
import Text from './Text';
import Title from './Title';
import logo from '@assets/logo.svg';
import type { MainNavigatorType } from '@navigation/MainNavigator';
import type { StartNavigatorType } from '@navigation/StartNavigator';

type ScreenLayoutProps = {
  children: React.ReactNode;
  scroll?: boolean;
  title?: string;
  bigTitle?: boolean;
  hasBack?: boolean;
  disableHardwareBack?: boolean;
  hasFooterBanner?: boolean;
  keyboardAvoidingView?: boolean;
  onKeyboardShow?: () => void;
  onKeyboardHide?: () => void;
  waitUntilNavigationFinish?: boolean;
  headerRightComponent?: React.ReactNode;
  headerRightComponentOnBigTitle?: boolean;
  goBack?: () => void;
  refreshControl?: ScrollViewProps['refreshControl'];
  footer?: React.ReactNode;
  footerHeight?: number | string;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
  gradientBackground?: boolean;
};

const ScreenWrapper = styled.View<{ gradientBackground: boolean }>`
  flex: 1;
  background-color: ${({ gradientBackground, theme }) => (gradientBackground
    ? 'transparent'
    : theme.colors.background.primary)};
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
  flex-direction: row;
  align-items: center;
`;

const Footer = styled(StaticLayout) <{ footerHeight?: number | string }>`
  align-items: flex-end;
  justify-content: center;
  ${({ footerHeight }) => (footerHeight
    ? `height: ${footerHeight}${typeof footerHeight !== 'string' ? 'px' : ''};`
    : '')}
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
  flex: 1;
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const LoadingWrapper = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const HeaderRightComponentWrapper = styled.View`
  flex: 1;
  align-items: flex-end;
  justify-content: center;
`;

const BigTitleWrapper = styled.View`
  flex-direction: row;
`;

const ScreenLayout = ({
  children,
  title,
  goBack,
  headerRightComponent,
  refreshControl,
  footer,
  footerHeight,
  contentContainerStyle,
  onKeyboardShow,
  onKeyboardHide,
  gradientBackground = false,
  scroll = false,
  hasBack = true,
  disableHardwareBack = false,
  hasFooterBanner = false,
  bigTitle = false,
  keyboardAvoidingView = false,
  waitUntilNavigationFinish = false,
  headerRightComponentOnBigTitle = false,
}: ScreenLayoutProps) => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<MainNavigatorType | StartNavigatorType>>();

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [canRender, setCanRender] = useState(!waitUntilNavigationFinish);

  const backAction = goBack ? goBack : () => navigation.goBack();

  useEffect(() => { // listeners
    const showKeyboardSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardOpen(true);
      onKeyboardShow?.();
    });
    const hideKeyboardSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardOpen(false);
      onKeyboardHide?.();
    });

    const backSubscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (disableHardwareBack || (!hasBack && !goBack)) return true;

      backAction();
      return true;
    });

    return () => {
      showKeyboardSubscription.remove();
      hideKeyboardSubscription.remove();
      backSubscription.remove();
    };
  }, []);

  useEffect(() => { // Wait until navigation finish (loading until first app render finish)
    if (!canRender) {
      const timeoutInstance = setTimeout(() => {
        setCanRender(true);
        clearTimeout(timeoutInstance);
      }, 0);
    }
  }, []);

  const hasHeaderTitle = !bigTitle && !!title;
  const hasBigTitle = bigTitle && !!title;
  const hasHeader = hasHeaderTitle || hasBack || (!headerRightComponentOnBigTitle && headerRightComponent);

  const contentScrollCondition = scroll
    ? (
      <ScrollViewWrapper
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
        contentContainerStyle={contentContainerStyle}
      >
        {children}
      </ScrollViewWrapper>
    ) : <BaseWrapper>{children}</BaseWrapper>;

  const content = keyboardAvoidingView ? (
    <KeyboardAvoidingView>
      {contentScrollCondition}
    </KeyboardAvoidingView>
  ) : contentScrollCondition;

  // TODO better loading (custom skeleton per screen and one by default)
  const loadingScreen = (
    <LoadingWrapper>
      <ActivityIndicator color={theme.colors.info} size={80} />
    </LoadingWrapper>
  );

  const renderFooter = (!!footer || hasFooterBanner) && !isKeyboardOpen;

  return (
    <>
      {gradientBackground && <BackgrounGradient />}
      <ScreenWrapper gradientBackground={gradientBackground}>
        <StyledSafeArea>
          {hasHeader && (
            <Header>
              {hasBack && <Icon onPress={backAction} name="chevron-left" />}
              {hasHeaderTitle && <HeaderTitle text={title} />}
              {headerRightComponent && !headerRightComponentOnBigTitle && (
                <HeaderRightComponentWrapper>
                  {headerRightComponent}
                </HeaderRightComponentWrapper>)}
            </Header>
          )}
          {hasBigTitle && (
            <BigTitleWrapper>
              <Title title={title} />
              {headerRightComponent && headerRightComponentOnBigTitle && (
                <HeaderRightComponentWrapper>
                  {headerRightComponent}
                </HeaderRightComponentWrapper>)}
            </BigTitleWrapper>
          )}
          {canRender ? content : loadingScreen}
          {renderFooter && (
            <Footer footerHeight={footerHeight}>
              {footer || (
                <>
                  <FooterText text="common.appName" />
                  <Svg svg={logo} size={24} />
                </>
              )}
            </Footer>
          )}
        </StyledSafeArea>
      </ScreenWrapper>
    </>
  );
};

export default ScreenLayout;
