import { forwardRef } from 'react';
import { StyleSheet, Text as NativeText, type TextProps, type TextStyle } from 'react-native';
import { Fonts } from '@/constants/theme';

export const AppText = forwardRef<NativeText, TextProps>(function AppText({ style, ...props }, ref) {
  const flattened = StyleSheet.flatten(style) as TextStyle | undefined;
  const weight = String(flattened?.fontWeight ?? '400');
  const isHeading = weight === 'bold' || Number(weight) >= 700;
  const fontFamily = flattened?.fontFamily ?? (isHeading ? Fonts.display : Fonts.sans);

  return <NativeText ref={ref} {...props} style={[{ fontFamily }, style]} />;
});
