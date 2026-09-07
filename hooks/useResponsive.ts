import { useWindowDimensions } from 'react-native';

export interface ResponsiveInfo {
  width: number;
  height: number;
  isDesktop: boolean;
  isTablet: boolean;
  isMobile: boolean;
  isWideDesktop: boolean;
}

export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();

  const isWideDesktop = width >= 1280;
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  return {
    width,
    height,
    isDesktop,
    isTablet,
    isMobile,
    isWideDesktop
  };
}
