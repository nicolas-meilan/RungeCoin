import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  ActivityIndicator,
  Keyboard,
} from 'react-native';

import { EventMapCore, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import Icon from './Icon';
import KeyboardAvoidingView from './KeyboardAvoidingView';
import Svg from './Svg';
import Text from './Text';
import Title from './Title';
import logo from '@assets/logo.svg';

type ScreenLayoutProps = {
  children: React.ReactNode;
  scroll?: boolean;
  title?: string;
  bigTitle?: boolean;
  hasBack?: boolean;
  hasFooterBanner?: boolean;
  keyboardAvoidingView?: boolean;
  waitUntilNavigationFinish?: boolean;
  rightIcon?: string;
  rightIconOnBigTitle?: boolean;
  onPressRightIcon?: () => void;
  goBack?: () => void;
  refreshControl?: JSX.Element;
  footer?: React.ReactNode;
  footerHeight?: number | string;
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
  flex-direction: row;
  align-items: center;
`;

const Footer = styled(StaticLayout)<{ footerHeight?: number | string }>`
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

const HeaderRightIconWrapper = styled.View`
  flex: 1;
  align-items: flex-end;
  justify-content: center;
`;

const HeaderRightIcon = styled(Icon)`
  color: ${({ theme }) => theme.colors.info};
`;

const BigTitleWrapper = styled.View`
  flex-direction: row;
`;

const ScreenLayout = ({
  children,
  title,
  goBack,
  onPressRightIcon,
  rightIcon,
  refreshControl,
  footer,
  footerHeight,
  scroll = false,
  hasBack = true,
  hasFooterBanner = false,
  bigTitle = false,
  keyboardAvoidingView = false,
  waitUntilNavigationFinish = false,
  rightIconOnBigTitle = false,
}: ScreenLayoutProps) => {
  const theme = useTheme();
  const navigation = useNavigation();

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [canRender, setCanRender] = useState(!waitUntilNavigationFinish);

  const backAction = goBack ? goBack : () => navigation.goBack();

  useEffect(() => { // keyboard listeners
    const showKeyboardSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardOpen(true);
    });
    const hideKeyboardSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardOpen(false);
    });

    const backSubscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!hasBack) return true;

      backAction();
      return true;
    });

    return () => {
      showKeyboardSubscription.remove();
      hideKeyboardSubscription.remove();
      backSubscription.remove();
    };
  }, []);

  useEffect(() => { // Initial loading
    if (!canRender) {
      const navigationListenerSuscription = navigation.addListener('transitionEnd' as keyof EventMapCore<any>, () => {
        setCanRender(true);
        navigationListenerSuscription();
      });
    }
  }, []);

  const hasHeaderTitle = !bigTitle && !!title;
  const hasBigTitle = bigTitle && !!title;
  const hasHeader = hasHeaderTitle || hasBack || (!rightIconOnBigTitle && rightIcon);

  const contentScrollCondition = scroll
    ? (
      <ScrollViewWrapper
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
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
    <ScreenWrapper>
      <StyledSafeArea>
        {hasHeader && (
          <Header>
            {hasBack && <Icon onPress={backAction} name="chevron-left" />}
            {hasHeaderTitle && <HeaderTitle text={title} />}
            {rightIcon && !rightIconOnBigTitle && (
              <HeaderRightIconWrapper>
                <HeaderRightIcon onPress={onPressRightIcon} name={rightIcon} />
              </HeaderRightIconWrapper>)}
          </Header>
        )}
        {hasBigTitle && (
          <BigTitleWrapper>
            <Title title={title} />
            {rightIcon && rightIconOnBigTitle && (
              <HeaderRightIconWrapper>
                <HeaderRightIcon onPress={onPressRightIcon} name={rightIcon} />
              </HeaderRightIconWrapper>)}
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
  );
};

export default ScreenLayout;
