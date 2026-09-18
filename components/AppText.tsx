import { forwardRef } from 'react';
import { StyleSheet, Text as NativeText, type TextProps, type TextStyle } from 'react-native';
import { Fonts } from '@/constants/theme';

export const AppText = forwardRef<NativeText, TextProps>(function AppText({ style, ...props }, ref) {
  const flattened = StyleSheet.flatten(style) as TextStyle | undefined;
  const weight = String(flattened?.fontWeight ?? '400');
  const numericWeight = weight === 'bold' ? 700 : Number(weight);
  const fontFamily = flattened?.fontFamily ?? (numericWeight >= 700 ? Fonts.sansBold : numericWeight >= 600 ? Fonts.sansSemiBold : numericWeight >= 500 ? Fonts.sansMedium : Fonts.sans);
  const fontSize = flattened?.fontSize;
  const lineHeight = flattened?.lineHeight ?? (fontSize && fontSize >= 12 && fontSize <= 17 ? Math.ceil(fontSize * 1.45) : undefined);

  return <NativeText ref={ref} {...props} style={[{ fontFamily, lineHeight }, style]} />;
});
